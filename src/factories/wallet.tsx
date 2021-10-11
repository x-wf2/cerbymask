import { Wallet } from "../classes/wallet"
import { KeystoreT } from '@radixdlt/crypto'
import { SigningKeychainT } from "@radixdlt/account";

export interface WalletFactoryInterface {
    newWallet(): Promise<Wallet>;
    getWallet(): Promise<Wallet>;
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void>;
    saveViewingAddress(index: number): Promise<void>;
    getViewingAddress(): Promise<number>;
    restoreViewingAddress(): Promise<void>;
}

export default class LocalWalletFactory implements WalletFactoryInterface {
    restoreViewingAddress(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ "addresses": 2 })
            chrome.storage.local.set({ "address": 0 })
            resolve()
        })
    }
    getViewingAddress(): Promise<number> {
        return new Promise((resolve) => {
            chrome.storage.local.get(["address"], async (address) => {
                try {
                    const error = chrome.runtime.lastError;
                    if (error) throw Error
                    resolve(address["address"])
                }
                catch (e) {
                    resolve(0)
                }
            })
        })
    }
    saveViewingAddress(index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["addresses"], (addresses) => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error)

                if ((index + 1) > addresses["addresses"])
                    chrome.storage.local.set({ "addresses": (index + 1) })

                chrome.storage.local.set({ "address": index }, () => {
                    const error = chrome.runtime.lastError;
                    if (error) return reject(error)
                    resolve()
                })
            })
        })
    }
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const json = JSON.stringify(keystore, null, '\t')

            chrome.storage.local.set({ "keystore": keystore }, () => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error)
            });
        });
    }
    newWallet(): Promise<Wallet> {
        return new Promise<Wallet>(async (resolve) => {
            await chrome.storage.local.set({ "keystore": undefined });
            await chrome.storage.local.set({ "address": 0 });
            await chrome.storage.local.set({ "addresses": 2 });
            resolve(new Wallet())
        });
    }
    getWallet(): Promise<Wallet> {
        return new Promise(async (resolve) => {
            let wallet: Wallet

            // Keystore
            chrome.storage.local.get(["keystore"], async (keystore) => {
                try {
                    const error = chrome.runtime.lastError;
                    if (error || typeof keystore["keystore"] === 'undefined') throw Error

                    // Seed
                    chrome.storage.local.get(["address"], async (address) => {
                        chrome.storage.local.get(["addresses"], async (addresses) => {
                            wallet = new Wallet()
                            wallet.key = Wallet.newKey()

                            wallet.key.keystore = keystore["keystore"]
                            wallet.selectedAddress = address["address"]
                            wallet.addresses = addresses["addresses"]

                            console.log(wallet)
                            resolve(wallet)
                        })
                    })
                }
                catch (e) {
                    wallet = await this.newWallet()
                    resolve(wallet)
                }
            })
        })
    }
}