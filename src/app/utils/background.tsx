import { Amount } from "@radixdlt/primitives"
import { mapEquals } from "@radixdlt/util"
import BigNumber from "bignumber.js"
import { Network } from "../../classes/network"
import { RequestT, SignedTransactionT, TransactionFieldsT } from "../types"
import { XRD_RRI } from "./utils"

export function getCurrentXRDUSDValue(): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-xrdusd-value", {})
        resolve(response)
    })
}

export function getWalletBalance(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-wallet-funds", { address: address })
        let xrdBalances = response.filter((item: any) => { return XRD_RRI.indexOf(item.rri) != -1 })
        let filtered = xrdBalances.map((item: any) => { return { ...item, amount: item.amount } })
        resolve(filtered)
    })
}

export function getAddressTokens(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-wallet-funds", { address: address })
        let balances = response.filter((item: any) => { return XRD_RRI.indexOf(item.rri) == -1 })
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

export function startNewTransaction(transaction: TransactionFieldsT) {
    return new Promise(async (resolve, reject) => {
        let response = await generateBackgroundRequest("build-transaction", { transaction: transaction })
        resolve(response)
    })
}

export function finalizeTransaction(transaction: SignedTransactionT) {
    return new Promise(async (resolve, reject) => {
        let response = await generateBackgroundRequest("finalize-transaction", { transaction: transaction })
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