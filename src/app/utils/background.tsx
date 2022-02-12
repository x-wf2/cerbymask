import { Network } from "../../classes/network"
import { Wallet } from "../../classes/wallet"
import { RequestT, SignedTransactionT, StakeT, TransactionFieldsT, ValidatorT } from "../types"
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
        let xrdBalances = response.liquid_balances.filter((item: any) => { return XRD_RRI.indexOf(item.token_identifier.rri) != -1 })
        let filtered = xrdBalances.map((item: any) => { return { ...item } })
        resolve(filtered.length > 0 ? filtered[0].value : 0)
    })
}

export function getAddressTokens(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-wallet-funds", { address: address })
        let balances = response.liquid_balances.filter((item: any) => { return XRD_RRI.indexOf(item.token_identifier.rri) == -1 })
        balances = Promise.all(balances.map(async (item: any) => {
            return { ...item, tokenInfo: { symbol: item.token_identifier.rri.split("_")[0]  } }
        }))
        resolve(balances)
    })
}


export function getStakedPositions(address: string): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-wallet-funds", { address: address })
        resolve(response.staked_and_unstaking_balance)
    })
}

export function getValidators(): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-validators", {})
        let acceptingStake = response.validators.filter((validator: ValidatorT) => validator.properties.external_stake_accepted)
        resolve(acceptingStake)
    })
}

export function getPromotedValidators(): Promise<any> {
    return new Promise(async (resolve) => {
        let response = await generateBackgroundRequest("get-promoted-validators", {})
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
        let response = await generateBackgroundRequest("build-transaction", { transaction: transaction, type: "TransferTokens" })
        resolve(response.transaction_build)
    })
}

export function finalizeTransaction(transaction: SignedTransactionT) {
    return new Promise(async (resolve, reject) => {
        let response = await generateBackgroundRequest("finalize-transaction", { transaction: transaction })
        resolve(response)
    })
}

export function startNewStake(stake: StakeT) {
    return new Promise(async (resolve, reject) => {
        let response = await generateBackgroundRequest("build-transaction", { transaction: stake, type: "StakeTokens" })
        resolve(response.transaction_build)
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