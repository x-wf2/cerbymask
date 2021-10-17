import { Amount } from "@radixdlt/primitives"
import { mapEquals } from "@radixdlt/util"
import BigNumber from "bignumber.js"
import { Network } from "../../classes/network"

export type RequestT = Readonly<{
    title: string,
    data: object
}>

export type BuildTransactionT = Readonly<{
    rri: string,
    from: string,
    to: string,
    amount: BigNumber
}>

export function getCurrentXRDUSDValue(): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-xrdusd-value", {})
        resolve(response)
    })
}

export function getWalletBalance(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-wallet-funds", { address: address })
        let xrdBalances = response.filter((item: any) => { return item.rri == "xrd_rr1qy5wfsfh" })
        let filtered = xrdBalances.map((item: any) => { return { ...item, amount: Amount.fromUnsafe(item.amount) } })
        resolve(filtered)
    })
}

export function getAddressTokens(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-wallet-funds", { address: address })
        let balances = response.filter((item: any) => { return item.rri !== "xrd_rr1qy5wfsfh" })
        balances = Promise.all(balances.map(async (item: any) => {
            let tokenInfo = await generateBackgroundRequest("get-token-info", { rri: item.rri })
            return { ...item, tokenInfo: tokenInfo.result }
        }))
        resolve(balances)
    })
}

export function getStakedPositions(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-staked-positions", { address: address })
        resolve(response)
    })
}

export function setNetwork(network: Network) {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("set-network", { network: network })
        resolve(response)
    })
}

function generateBackgroundRequest(title: string, payload: object): any {
    let message = {
        title: title,
        data: payload
    } as RequestT

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, function (response) {
            resolve(response)
        });
    })
}