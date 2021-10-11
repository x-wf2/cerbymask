import { Wallet } from "../classes/wallet";
import LocalWalletFactory, { WalletFactoryInterface } from "../factories/wallet";
import { KeystoreT } from '@radixdlt/crypto'
import { resolve } from "path";
import NetworkFactory, { NetworkFactoryInterface } from "../factories/network";
import { Network } from "../classes/network";
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs'
import {
    AccountAddress,
    AccountsT,
    AccountT,
    Radix,
    RadixT,
    Network as RadixNetwork,
    Wallet as RadixWallet,
    SigningKeychain,
    SigningKeychainT
} from "@radixdlt/application";

export interface Provider {
    getWallet(): Promise<Wallet>;
    newWallet(): Promise<Wallet>;
    saveWallet(keystore: KeystoreT, wallet: Wallet): Promise<void>;
    connectWallet(wallet: Wallet): Promise<boolean>;
    getInstance(): RadixT;
    saveViewingAddress(index: number): Promise<void>;
    getViewingAddress(): Promise<number>;
    restoreViewingAddress(): Promise<number>;
}

export class LocalProvider implements Provider {
    walletFactory: WalletFactoryInterface;
    networkFactory: NetworkFactoryInterface;

    radix: RadixT;
    network?: Network;

    constructor(walletFactory?: WalletFactoryInterface) {
        this.walletFactory = walletFactory ? walletFactory : new LocalWalletFactory()
        this.networkFactory = new NetworkFactory()
        this.radix = Radix.create()

        this.networkFactory.newNetwork("MAINNET", "https://mainnet.radixdlt.com")
    }
    restoreViewingAddress(): Promise<number> {
        throw this.walletFactory.restoreViewingAddress()
    }

    getViewingAddress(): Promise<number> {
        throw this.walletFactory.getViewingAddress()
    }

    saveViewingAddress(index: number): Promise<void> {
        return this.walletFactory.saveViewingAddress(index)
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

    connectWallet(wallet: Wallet): Promise<boolean> {
        return new Promise(async (finish) => {
            console.log("Connecting Wallet...")
            finish(true)
        });
    }
    getInstance(): RadixT {
        return this.radix
    }
}
