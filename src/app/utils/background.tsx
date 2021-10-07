import { Amount } from "@radixdlt/primitives"

import BigNumber from "bignumber.js"

export type RequestT = Readonly<{
    title: string,
    data: object
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
        let filtered = response.map((item: any) => {return {...item, amount: Amount.fromUnsafe(item.amount)}})
        resolve(filtered)
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