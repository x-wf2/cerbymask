import { Wallet } from "../classes/wallet";
import LocalWalletFactory, { WalletFactoryInterface } from "../factories/wallet";
import { KeystoreT } from '@radixdlt/crypto'
import { resolve } from "path";
import NetworkFactory, { NetworkFactoryInterface, NETWORKS } from "../factories/network";
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
    saveViewingAddress(index: number): Promise<void>;
    getViewingAddress(): Promise<number>;
    restoreViewingAddress(): Promise<void>;
    monitorAddresses(addresses: AccountT[]): Promise<void>;

    addRadixNetwork(network: Network): Promise<void>;
    useRadixNetwork(network: Network): Promise<void>;
    getCurrentNetwork(): Promise<Network>;
}

export class LocalProvider implements Provider {
    walletFactory: WalletFactoryInterface;
    networkFactory: NetworkFactoryInterface;

    constructor(networkFactory?: NetworkFactoryInterface, walletFactory?: WalletFactoryInterface) {
        this.walletFactory = walletFactory || new LocalWalletFactory()
        this.networkFactory = networkFactory || new NetworkFactory(([NETWORKS.mainnet]))

        if(!networkFactory)
            this.networkFactory.setSelectedNetwork(NETWORKS.mainnet)
    }

    getCurrentNetwork(): Promise<Network> {
        return this.networkFactory.getSelectedNetwork()
    }

    addRadixNetwork(network: Network): Promise<void> {
        return new Promise((resolve, reject) => {
            this.networkFactory.addNetwork(network)
            resolve()
        })
    }

    useRadixNetwork(network: Network): Promise<void> {
        return new Promise((resolve, reject) => {
            this.networkFactory.setSelectedNetwork(network)
            resolve()
        })
    }

    monitorAddresses(addresses: AccountT[]): Promise<void> {
        return this.walletFactory.monitorAddresses(addresses)
    }

    restoreViewingAddress(): Promise<void> {
        return this.walletFactory.restoreViewingAddress()
    }

    getViewingAddress(): Promise<number> {
        return this.walletFactory.getViewingAddress()
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
}
