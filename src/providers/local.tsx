import { Wallet } from "../classes/wallet";
import LocalWalletFactory, { WalletFactoryInterface } from "../factories/wallet";
import { KeystoreT } from '@radixdlt/crypto'

export interface Provider {
    getWallet(): Promise<Wallet>;
    newWallet(): Promise<Wallet>;
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void>;
}

export class LocalProvider implements Provider {
    walletFactory: WalletFactoryInterface;

    constructor(walletFactory?: WalletFactoryInterface) {
        this.walletFactory = walletFactory ? walletFactory : new LocalWalletFactory()
    }
    newWallet(): Promise<Wallet> {
        return this.walletFactory.newWallet()
    }
    getWallet(): Promise<Wallet> {
        return this.walletFactory.getWallet()
    }
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void> {
        return this.walletFactory.saveWallet(keystore, wallet)
    }
}
