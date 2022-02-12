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
    return true;
});

let currentNetwork = { name: "", url: "" };
let TokensInfoValueCache = {};
let WalletStakeValueCache = {};
let WalletFundsValueCache = {};
let XRDValueCache = {};

function startMonitoring() {
    chrome.storage.local.get(["monitor"], async (monitor) => {
        let addresses = monitor["monitor"]
        currentNetwork = await refreshNetwork()
        if (addresses) {
            await handleGetXRDUSDValue({ data: { canUpdate: true } }, () => { })
            addresses.map(async (address) => {
                // await handleStakedPositions({ data: { address: address, canUpdate: true } }, () => { })
                await handleGetWalletFunds({ data: { address: address, canUpdate: true } }, (balances) => {
                    // balances.map(async (item) => await handleGetTokenInfo({ data: { rri: item.rri, canUpdate: true } }, () => { }))
                    console.log("radix.js handleGetWalletFunds:")
                    console.log(balances)
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
    if (currentNetwork.name.toLowerCase() !== "mainnet") {
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

    currentNetwork = await refreshNetwork()
    if (!WalletFundsValueCache[address] || canUpdate && ((Number(new Date()) - Number(WalletFundsValueCache[address].lastUpdate)) > 5000)) {
        const payload = {
            "network_identifier": {
                "network": currentNetwork.name
            },
            "account_identifier": {
                "address": address
            }
        }

        const rawResponse = await getData("account/balances", payload)
        if (rawResponse.status == 200) {
            const json = await rawResponse.json()

            console.log("account balances json:")
            console.log(json)
            WalletFundsValueCache[address] = {
                response: json.account_balances,
                lastUpdate: new Date()
            }
        }
    }
    reply(WalletFundsValueCache[address].response)
}

async function handleBuildTransaction(request, reply) {
    let transaction = request.data.transaction
    transaction.type = request.data.type

    const params = {
        "actions": [
            {
                "type": transaction.type,
                "from_account": {
                    "address": transaction.from
                },
                "amount": {
                    "token_identifier": {
                        "rri": transaction.rri
                    },
                    "value": transaction.amount
                }
            }
        ],
        "fee_payer": {
            "address": transaction.from
        },
        "network_identifier": {
            "network": currentNetwork.name,
        },
        "disable_token_mint_and_burn": true
    }
    params.actions[0][transaction.type == "TransferTokens" ? "to_account": "to_validator"] = {
        "address": transaction.to
    }
    const rawResponse = await getData("transaction/build", params)
    const json = await rawResponse.json()
    reply(json)
}

async function handleFinalizeTransaction(request, reply) {
    let transaction = request.data.transaction

    const params = {
        "network_identifier": {
            "network": currentNetwork.name
        },
        "unsigned_transaction": transaction.unsigned_transaction,
        "signature": {
            "bytes": transaction.bytes,
            "public_key": {
                "hex": transaction.pubKey
            }
        },
        "submit": true
    }
    try {
        const rawResponse = await getData("transaction/finalize", params)
        const json = await rawResponse.json()
        reply(json)
    }
    catch (e) {
        reply({})
    }
}

async function handleGetValidators(request, reply) {
    let params = {
        "network_identifier": {
            "network": currentNetwork.name
        },
    }
    const rawResponse = await getData("validators", params)
    const json = await rawResponse.json()
    reply(json)
}

async function handleGetPromotedValidators(request, reply) {
    const rawResponse = await fetch('https://api.npoint.io/e362e89867d427eba6cf', {})
    if(rawResponse.status == 200) {
        const content = await rawResponse.json();
        reply(content)
    }
}

async function getData(endpoint, params) {
    if (!currentNetwork || Object.keys(currentNetwork).length == 0)
        currentNetwork = await refreshNetwork()

    const payload = params
    let url = currentNetwork.url

    try {
        console.log("Sending payload:")
        console.log(payload)
        const rawResponse = await fetch(`${url}${endpoint}`, {
            method: 'POST',
            headers: {
                "X-Radixdlt-Target-Gw-Api": "1.1.0",
                "Content-Type": "application/json"
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

function refreshNetwork() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["network"], async (network) => {
            if (network["network"] == undefined)
                network["network"] = setMainnet()
            currentNetwork = network["network"]

            resolve(currentNetwork)
        })
    })
}

// Set stored network to MAINNET
function setMainnet() {
    let mainnet = { name: "mainnet", url: "https://mainnet.radixdlt.com/" }
    chrome.storage.local.set({ "network": mainnet })
    return mainnet
}