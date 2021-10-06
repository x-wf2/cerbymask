import { Wallet } from "../../classes/wallet"
import { MnemomicT, KeystoreT, SigningKeychain, SigningKeychainT, Wallet as RadixWallet, WalletT as RadixWalletT, Network as RadixNetwork } from '@radixdlt/application'
import { Provider } from "../../providers/local";
import { resolve } from "path";


export async function generateWalletWithKeyAndMnemonic() {
    let wallet = new Wallet();
    wallet.key = Wallet.newKey()
    return wallet
}

export async function saveWalletForLocalProvider(wallet: Wallet, provider: Provider) {
    const walletResult = await SigningKeychain.byEncryptingMnemonicAndSavingKeystore({
        mnemonic: wallet.key?.mnemonic as MnemomicT,
        password: wallet.password as string,
        save: (keystore: KeystoreT): Promise<void> => {
            return provider.saveWallet(keystore, wallet)
        }
    })
    return walletResult
}

export function unlockWallet(wallet: Wallet): Promise<RadixWalletT> {
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
            (signingKeychain: SigningKeychainT) => {
                const radixWallet = RadixWallet.create({
                    signingKeychain: signingKeychain,
                    network: "MAINNET" as RadixNetwork,
                })
                resolve(radixWallet)
            },
            error => new Function(),
        )
    })

}