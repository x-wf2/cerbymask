import { Wallet } from "../classes/wallet"
import { KeystoreT } from '@radixdlt/crypto'
import { SigningKeychainT } from "@radixdlt/account";
import { AccountT } from "@radixdlt/application";

export interface WalletFactoryInterface {
    newWallet(): Promise<Wallet>;
    getWallet(): Promise<Wallet>;
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void>;
    saveViewingAddress(index: number): Promise<void>;
    getViewingAddress(): Promise<number>;
    restoreViewingAddress(): Promise<void>;
    monitorAddresses(addresses: AccountT[]): Promise<void>;
}

export default class LocalWalletFactory implements WalletFactoryInterface {
    constructor() {}

    restoreViewingAddress(storage = chrome.storage): Promise<void> {
        return new Promise((resolve) => {
            storage.local.set({ "addresses": 2 })
            storage.local.set({ "address": 0 })
            resolve()
        })
    }
    getViewingAddress(storage = chrome.storage): Promise<number> {
        return new Promise((resolve) => {
            storage.local.get(["address"], async (address: any) => {
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
    saveViewingAddress(index: number, storage = chrome.storage): Promise<void> {
        return new Promise((resolve, reject) => {
            storage.local.get(["addresses"], (addresses: any) => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error)

                if ((index + 1) > addresses["addresses"])
                    storage.local.set({ "addresses": (index + 1) })

                storage.local.set({ "address": index }, () => {
                    const error = chrome.runtime.lastError;
                    if (error) return reject(error)
                    resolve()
                })
            })
        })
    }
    monitorAddresses(addresses: AccountT[], storage = chrome.storage): Promise<void> {
        return new Promise((resolve, reject) => {
            storage.local.get(["monitor"], (monitor: any) => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error)

                let addressesString = addresses.map(account => account.address.toString())
                monitor["monitor"] = addressesString

                storage.local.set({ "monitor": monitor["monitor"] }, () => {
                    const error = chrome.runtime.lastError;
                    if (error) return reject(error)
                    resolve()
                })
            })
        })
    }
    saveWallet(keystore: KeystoreT, wallet: Wallet, storage = chrome.storage): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            storage.local.set({ "keystore": keystore }, () => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error)
                resolve()
            });
        });
    }
    newWallet(storage = chrome.storage): Promise<Wallet> {
        return new Promise<Wallet>(async (resolve) => {
            await storage.local.set({ "keystore": undefined });
            await storage.local.set({ "address": 0 });
            await storage.local.set({ "addresses": 2 });
            await storage.local.set({ "currency": "USD" });
            await storage.local.set({ "monitor": [] });
            resolve(new Wallet())
        });
    }
    getWallet(storage = chrome.storage): Promise<Wallet> {
        return new Promise(async (resolve) => {
            let wallet: Wallet

            // Keystore
            storage.local.get(["keystore"], async (keystore: any) => {
                try {
                    const error = chrome.runtime.lastError;
                    if (error || typeof keystore["keystore"] === 'undefined') throw Error

                    storage.local.get(["address"], async (address: any) => {
                        storage.local.get(["addresses"], async (addresses: any) => {
                            storage.local.get(["currency"], async (currency: any) => {
                                wallet = new Wallet()
                                wallet.key = Wallet.newKey()

                                wallet.key.keystore = keystore["keystore"]
                                wallet.selectedAddress = address["address"]
                                wallet.addresses = addresses["addresses"]
                                wallet.currency = currency["currency"]

                                resolve(wallet)
                            })
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