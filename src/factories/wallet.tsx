import { Wallet } from "../classes/wallet"
import { KeystoreT } from '@radixdlt/crypto'
import { SigningKeychainT } from "@radixdlt/account";

export interface WalletFactoryInterface {
    newWallet(): Promise<Wallet>;
    getWallet(): Promise<Wallet>;
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void>;
}

export default class LocalWalletFactory implements WalletFactoryInterface {
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const json = JSON.stringify(keystore, null, '\t')

            chrome.storage.local.set({ "keystore": keystore }, () => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error)

                chrome.storage.local.set({ "seed": wallet.key?.mnemonic.phrase }, () => {
                    const error = chrome.runtime.lastError;
                    if (error) return reject(error)

                    resolve()
                })
            });
        });
    }
    newWallet(): Promise<Wallet> {
        return new Promise<Wallet>(async (resolve) => {
            await chrome.storage.local.set({ "keystore": undefined });
            await chrome.storage.local.set({ "seed": undefined });
            resolve(new Wallet())
        });
    }
    getWallet(): Promise<Wallet> {
        return new Promise(async (resolve) => {
            let wallet: Wallet
            chrome.storage.local.get(["keystore"], async (keystore) => {
                try {
                    const error = chrome.runtime.lastError;
                    if (error || typeof keystore["keystore"] === 'undefined') throw Error
                    
                    chrome.storage.local.get(["seed"], async (seed) => {
                        try {
                            const error = chrome.runtime.lastError;
                            if (error) throw Error
                            
                            wallet = new Wallet()
                            wallet.key = Wallet.newKey()
                            
                            wallet.key.keystore = keystore["keystore"]
                            wallet.key.mnemonic = seed["seed"]

                            resolve(wallet)
                        }
                        catch (e) {
                            wallet = await this.newWallet()
                            resolve(wallet)
                        }
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