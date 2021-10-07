import { Wallet, WalletBalanceT } from "../../classes/wallet"
import { MnemomicT, KeystoreT, SigningKeychain, SigningKeychainT, Wallet as RadixWallet, WalletT as RadixWalletT, Network as RadixNetwork, AccountT } from '@radixdlt/application'
import { Provider } from "../../providers/local";
import { resolve } from "path";
import { getCurrentXRDUSDValue, getWalletBalance } from "./background";
import BigNumber from "bignumber.js"
import { formatBigNumber, numberFormatUSA } from "./formatters";

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

export async function getXRDUSDBalances(radixPublicAddresses: AccountT[]) {
    let xrdValue = (await getCurrentXRDUSDValue())

    return Promise.all(radixPublicAddresses.map(async (address) => {
        let balance = (await getWalletBalance(address?.address.toString()))[0]
        let usdBalance = new BigNumber(balance?.amount.value.toString())
                                .multipliedBy(parseFloat(xrdValue.bid))
                                .shiftedBy(-18).toFixed(4)
        return { 
            address: address.address.toString(),
            xrd: !balance ? undefined : balance?.amount,
            balance: !balance ? 0 : usdBalance
        } as WalletBalanceT
    }))
}