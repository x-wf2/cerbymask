chrome.windows.onCreated.addListener(function() {
    console.log("CerbyMask detected a new browser opening")
    setInterval(() => {startMonitoring()}, 2000)
})

chrome.runtime.onInstalled.addListener(function() {
    console.log("CerbyMask detected a new installation")
    setInterval(() => {startMonitoring()}, 2000)
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
        if(addresses) {
            await handleGetXRDUSDValue({data: {canUpdate: true}}, () => {})
            addresses.map(async (address) => {
                await handleStakedPositions({data: {address: address, canUpdate: true}}, () => {})
                await handleGetWalletFunds({data: {address: address, canUpdate: true}}, (balances) => {
                    balances.map(async (item) => await handleGetTokenInfo({data: {rri: item.rri, canUpdate: true}}, () => {}))
                })
            }, () => {})
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
    if(!TokensInfoValueCache[rri] || canUpdate && (Number(new Date()) - Number(TokensInfoValueCache[rri].lastUpdate)) > 600000) {
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
    if(!WalletStakeValueCache[address] || canUpdate && ((Number(new Date()) - Number(WalletStakeValueCache[address].lastUpdate)) > 20000)) {
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
    if(!('lastUpdate' in XRDValueCache) || canUpdate && (Number(new Date()) - Number(XRDValueCache.lastUpdate)) > 5000) {
        const rawResponse = await fetch('https://api.bitfinex.com/v1/pubticker/xrdusd', {})
        const content = await rawResponse.json();
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
    if(!WalletFundsValueCache[address] || canUpdate && ((Number(new Date()) - Number(WalletFundsValueCache[address].lastUpdate)) > 20000)) {
        const rawResponse = await getData("account.get_balances", { "address": address })
        const json = await rawResponse.json()
        WalletFundsValueCache[address] = {
            response: json.result.tokenBalances,
            lastUpdate: new Date()
        }
    }
    reply(WalletFundsValueCache[address].response)
}

async function getData(method, params, endpoint="archive") {
    const payload = { "jsonrpc": "1.0", "id": "curltest", "method": method, "params":  params}

    // URL Discovery
    if('address' in params) {
        if(params.address.startsWith("rdx"))
            currentNetwork.url = "https://mainnet.radixdlt.com/"
        else if(params.address.startsWith("tdx"))
            currentNetwork.url = "https://stokenet.radixdlt.com/"
    }
    
    const rawResponse = await fetch(`${currentNetwork.url}${endpoint}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
    });
    return rawResponse
}