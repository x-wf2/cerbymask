chrome.windows.onCreated.addListener(function() {
    console.log("CerbyMask detected a new browser opening")
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
    return true;
});

async function handleGetTokenInfo(request, reply) {
    const rri = request.data.rri
    
    const rawResponse = await getData("tokens.get_info", { "rri": rri })
    const content = await rawResponse.json();

    reply(content)
}

async function handleStakedPositions(request, reply) {
    const address = request.data.address
    
    const rawResponse = await getData("account.get_stake_positions", { "address": address })
    const content = await rawResponse.json();

    reply(content)
}

async function handleGetXRDUSDValue(request, reply) {
    const rawResponse = await fetch('https://api.bitfinex.com/v1/pubticker/xrdusd', {})
    const content = await rawResponse.json();
    reply(content)
}

async function handleGetWalletFunds(request, reply) {
    const address = request.data.address
    
    const rawResponse = await getData("account.get_balances", { "address": address })
    const content = await rawResponse.json()

    reply(content.result.tokenBalances)
}

async function getData(method, params, endpoint="archive") {
    const payload = { "jsonrpc": "1.0", "id": "curltest", "method": method, "params":  params}
    const rawResponse = await fetch(`https://mainnet.radixdlt.com/${endpoint}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
    });
    return rawResponse
}