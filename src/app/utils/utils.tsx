import { Wallet, WalletBalanceT, WalletStakeT, WalletTokensT } from "../../classes/wallet"
import { MnemomicT, KeystoreT, SigningKeychain, SigningKeychainT, Wallet as RadixWallet, WalletT as RadixWalletT, Network as RadixNetwork, AccountT } from '@radixdlt/application'
import { Provider } from "../../providers/local";
import { resolve } from "path";
import { getCurrentXRDUSDValue, getWalletBalance, getStakedPositions as getStakes, getAddressTokens, setNetwork } from "./background";
import BigNumber from "bignumber.js"
import { formatBigNumber, numberFormatUSA } from "./formatters";
import { Network } from "../../classes/network";

export const XRD_RRI = ["xrd_rr1qy5wfsfh", "xrd_tr1qyf0x76s"]

export async function generateWalletWithKeyAndMnemonic() {
    let wallet = new Wallet();
    wallet.key = Wallet.newKey()
    return wallet
}

export function saveWalletForProvider(wallet: Wallet, provider: Provider): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let walletResult = await SigningKeychain.byEncryptingMnemonicAndSavingKeystore({
            mnemonic: wallet.key?.mnemonic as MnemomicT,
            password: wallet.password as string,
            save: (keystore: KeystoreT): Promise<void> => {
                return provider.saveWallet(keystore, wallet)
            }
        })
        if (walletResult.isErr()) {
            console.log("Throwing error")
            reject()
        }
        walletResult.match(
            async (signingKeychain: SigningKeychainT) => {
                const networkName = (await provider.getCurrentNetwork()).name
                const radixWallet = RadixWallet.create({
                    signingKeychain: signingKeychain,
                    network: networkName as RadixNetwork,
                })
                resolve(radixWallet)
            },
            error => new Promise(() => reject())
        )
    })
}

export function saveViewingAddressForProvider(index: number, provider: Provider) {
    return provider.saveViewingAddress(index)
}

export function monitorAddressesForProvider(addresses: AccountT[], provider: Provider) {
    return provider.monitorAddresses(addresses)
}

export function setBackgroundNetwork(network: Network) {
    return setNetwork(network)
}

export function unlockWallet(wallet: Wallet, provider: Provider): Promise<RadixWalletT> {
    return new Promise(async (resolve, reject) => {

        const walletResult = await SigningKeychain.byLoadingAndDecryptingKeystore({
            password: wallet.password as string,
            load: (): Promise<KeystoreT> => {
                return new Promise((resolve) => resolve(wallet.key?.keystore as KeystoreT))
            }
        })
        if (walletResult.isErr())
            reject()

        walletResult.match(
            async (signingKeychain: SigningKeychainT) => {
                const networkName = (await provider.getCurrentNetwork()).name.toUpperCase()
                const radixWallet = RadixWallet.create({
                    signingKeychain: signingKeychain,
                    network: networkName as RadixNetwork,
                })
                resolve(radixWallet)
            },
            error => new Promise(() => reject())
        )
    })
}

export async function getXRDUSDBalances(radixPublicAddresses: AccountT[]) {
    let xrdValue = (await getCurrentXRDUSDValue())
    return Promise.all(radixPublicAddresses.map(async (address) => {
        let balance = (await getWalletBalance(address?.address.toString()))

        let usdBalance = new BigNumber(balance.toString())
            .multipliedBy(parseFloat(xrdValue.bid))
            .shiftedBy(-18).toFixed(4)
        return {
            address: address.address.toString(),
            balance: !balance ? 0 : usdBalance,
            xrd: !balance ? new BigNumber(0) : new BigNumber(balance)
        } as WalletBalanceT
    }))
}

export async function getTokenBalances(radixPublicAddresses: AccountT[]) {
    return Promise.all(radixPublicAddresses.map(async (account: AccountT) => {
        let address = account.address.toString()
        let response = await getAddressTokens(address)
        let result = {
            address: address,
            tokens: response
        } as WalletTokensT
        return result
    }))
}

export async function getStakedPositions(radixPublicAddresses: AccountT[]) {
    let xrdValue = (await getCurrentXRDUSDValue())
    return Promise.all(radixPublicAddresses.map(async (address) => {
        let stakedValue = new BigNumber((await getStakes(address?.address.toString())).value)
        let staked = ""

        let usdBalance = ""
        if (stakedValue) {
            usdBalance = stakedValue.multipliedBy(parseFloat(xrdValue.bid)).shiftedBy(-18).toFixed(4)
            staked = formatBigNumber(stakedValue.shiftedBy(-18))
        }
        return {
            address: address?.address.toString(),
            initial: "string",
            rewards: "string",
            unstaking: "string",
            staked: staked,
            balance: usdBalance
        } as WalletStakeT
    }))
}
