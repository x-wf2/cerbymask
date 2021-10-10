
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
    return true;
});

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
    const content = await rawResponse.json();

    const xrdBalances = content.result.tokenBalances.filter((item) => {return item.rri == "xrd_rr1qy5wfsfh"})
    reply(xrdBalances)
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