chrome.windows.onCreated.addListener(function () {
    console.log("CerbyMask detected a new browser opening")
    startMonitoring()
    chrome.alarms.create('monitor', { periodInMinutes: 1 });
})

chrome.runtime.onInstalled.addListener(function () {
    console.log("CerbyMask detected a new installation")
    startMonitoring()
    chrome.alarms.create('monitor', { periodInMinutes: 1 });
})

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'monitor') {
        startMonitoring()
        for (let i = 1; i <= 5; i++) // 1 min
            setTimeout(() => { startMonitoring() }, i * 10000)
    }
})

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    if (request.title == "get-wallet-funds") {
        handleGetWalletFunds(request, reply)
    }
    else if (request.title == "get-xrdusd-value") {
        handleGetXRDUSDValue(request, reply)
    }
    else if (request.title == "get-staked-positions") {
        handleStakedPositions(request, reply)
    }
    else if (request.title == "get-token-info") {
        handleGetTokenInfo(request, reply)
    }
    else if (request.title == "get-token-info") {
        handleGetTokenInfo(request, reply)
    }
    else if (request.title == "set-network") {
        handleSetNetwork(request, reply)
    }
    else if (request.title == "build-transaction") {
        handleBuildTransaction(request, reply)
    }
    else if (request.title == "finalize-transaction") {
        handleFinalizeTransaction(request, reply)
    }
    else if (request.title == "get-validators") {
        handleGetValidators(request, reply)
    }
    else if (request.title == "get-promoted-validators") {
        handleGetPromotedValidators(request, reply)
    }
    return true;
});

let currentNetwork = {};
let TokensInfoValueCache = {};
let WalletStakeValueCache = {};
let WalletFundsValueCache = {};
let XRDValueCache = {};

function startMonitoring() {

    chrome.storage.local.get(["monitor"], async (monitor) => {
        let addresses = monitor["monitor"]
        if (addresses) {
            await handleGetXRDUSDValue({ data: { canUpdate: true } }, () => { })
            addresses.map(async (address) => {
                await handleStakedPositions({ data: { address: address, canUpdate: true } }, () => { })
                await handleGetWalletFunds({ data: { address: address, canUpdate: true } }, (balances) => {
                    balances.map(async (item) => await handleGetTokenInfo({ data: { rri: item.rri, canUpdate: true } }, () => { }))
                })
            }, () => { })
        }
    })
}

async function handleSetNetwork(request, reply) {
    const network = request.data.network
    currentNetwork = network
    reply()
}

async function handleGetTokenInfo(request, reply) {
    const rri = request.data.rri
    const canUpdate = request.data.canUpdate || false
    if (!TokensInfoValueCache[rri] || canUpdate && (Number(new Date()) - Number(TokensInfoValueCache[rri].lastUpdate)) > 600000) {
        const rawResponse = await getData("tokens.get_info", { "rri": rri })
        const content = await rawResponse.json();
        TokensInfoValueCache[rri] = {
            response: content,
            lastUpdate: new Date()
        }
    }
    reply(TokensInfoValueCache[rri].response)
}

async function handleStakedPositions(request, reply) {
    const address = request.data.address
    const canUpdate = request.data.canUpdate || false
    if (!WalletStakeValueCache[address] || canUpdate && ((Number(new Date()) - Number(WalletStakeValueCache[address].lastUpdate)) > 5000)) {
        const rawResponse = await getData("account.get_stake_positions", { "address": address })
        const content = await rawResponse.json();
        WalletStakeValueCache[address] = {
            response: content,
            lastUpdate: new Date()
        }
    }
    reply(WalletStakeValueCache[address].response)
}

async function handleGetXRDUSDValue(request, reply) {
    const canUpdate = request.data.canUpdate || false
    const emptyBid = { bid: 0 }
    if (currentNetwork.name !== "MAINNET") {
        XRDValueCache = {
            response: emptyBid
        }
    }
    else if (!('lastUpdate' in XRDValueCache) || canUpdate && (Number(new Date()) - Number(XRDValueCache.lastUpdate)) > 5000) {
        let content
        const rawResponse = await fetch('https://api.bitfinex.com/v1/pubticker/xrdusd', {})
        content = await rawResponse.json();

        XRDValueCache = {
            response: content,
            lastUpdate: new Date()
        }
    }
    reply(XRDValueCache.response)
}

async function handleGetWalletFunds(request, reply) {
    const address = request.data.address
    const canUpdate = request.data.canUpdate || false
    if (!WalletFundsValueCache[address] || canUpdate && ((Number(new Date()) - Number(WalletFundsValueCache[address].lastUpdate)) > 5000)) {
        const rawResponse = await getData("account.get_balances", { "address": address })
        const json = await rawResponse.json()
        WalletFundsValueCache[address] = {
            response: json.result.tokenBalances,
            lastUpdate: new Date()
        }
    }
    reply(WalletFundsValueCache[address].response)
}

async function handleBuildTransaction(request, reply) {
    let transaction = request.data.transaction
    transaction.type = request.data.type

    const transactionPayload = { "actions": [transaction], "feePayer": transaction.from }
    const rawResponse = await getData("construction.build_transaction", transactionPayload, "construction")

    const json = await rawResponse.json()
    reply(json.result)
}

async function handleFinalizeTransaction(request, reply) {
    let transaction = request.data.transaction
    transaction.immediateSubmit = true

    try {
        const rawResponse = await getData("construction.finalize_transaction", transaction, "construction")
        const json = await rawResponse.json()
        reply(json.result)
    }
    catch(e) {
        reply({})
    }
}

async function handleGetValidators(request, reply) {
    let size = request.data.size || 25
    let params = { "size": size }
    const rawResponse = await getData("validators.get_next_epoch_set", params)
    const json = await rawResponse.json()
    reply(json.result)
}

async function handleGetPromotedValidators(request, reply) {
    const rawResponse = await fetch('https://api.npoint.io/e362e89867d427eba6cf', {})
    const content = await rawResponse.json();
    reply(content)
}

async function getData(method, params, endpoint = "archive") {
    const payload = { "jsonrpc": "2.0", "id": "0", "method": method, "params": params }
    
    if (!currentNetwork || Object.keys(currentNetwork).length == 0)
        currentNetwork = await refreshNetwork()
    
    console.log("getData")
    console.log(currentNetwork)

    let url = currentNetwork.url

    // URL Discovery
    if ('address' in params)
        url = getNetworkFromAddress(params.address)
    else if ('feePayer' in params)
        url = getNetworkFromAddress(params.feePayer)

    try {
        const rawResponse = await fetch(`${url}${endpoint}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(payload)
        });
        return rawResponse
    }
    catch (e) {
        console.log(e)
        return {}
    }
}

function getNetworkFromAddress(address) {
    let url
    if (address.startsWith("rdx"))
        url = "https://mainnet.radixdlt.com/"
    else if (address.startsWith("tdx"))
        url = "https://stokenet.radixdlt.com/"
    return url
}

function refreshNetwork() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["network"], async (network) => {
            resolve(JSON.parse(network["network"]))
        })  
    })
}