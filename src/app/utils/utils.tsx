import { Wallet } from "../../classes/wallet"
import { MnemomicT, KeystoreT, SigningKeychain } from '@radixdlt/application'
import { Provider } from "../../providers/local";


export async function generateWalletWithKeyAndMnemonic() {
    let wallet = new Wallet();
    wallet.key = Wallet.newKey()
    return wallet
}

export async function saveWalletForLocalProvider(wallet: Wallet, provider: Provider) {
    const walletResult = await SigningKeychain.byEncryptingMnemonicAndSavingKeystore({
        mnemonic: wallet.key?.mnemonic as MnemomicT,
        password: wallet.password as string,
        save: (keystore: KeystoreT): Promise<void> => {
            return provider.saveWallet(keystore, wallet)
        }
    })
    return walletResult
}

export async function unlockWallet(wallet: Wallet) {
    const walletResult = await SigningKeychain.byLoadingAndDecryptingKeystore({
        password: wallet.password as string,
        load: (): Promise<KeystoreT> => {
            return new Promise((resolve) => resolve(wallet.key?.keystore as KeystoreT))
        }
    })
    if (walletResult.isErr())
        return undefined
    return walletResult
}