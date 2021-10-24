import { Wallet } from "../classes/wallet"
import { KeystoreT } from '@radixdlt/crypto'
import { SigningKeychainT } from "@radixdlt/account";
import { Network } from "../classes/network";


export const NETWORKS = {
    "MAINNET": new Network("MAINNET", "https://mainnet.radixdlt.com/"),
    "STOKENET": new Network("STOKENET", "https://stokenet.radixdlt.com/")
}

export interface NetworkFactoryInterface {
    addNetwork(networkToAdd: Network): Promise<Network>;
    getNetwork(name: string): Promise<Network[]>;
    setSelectedNetwork(network: Network): Promise<void>;
    getSelectedNetwork(): Promise<Network>;
}

export default class NetworkFactory implements NetworkFactoryInterface {
    networks: Network[];
    selectedNetwork?: Network;

    constructor(networks?: Network[], selected?: Network) {
        this.networks = networks || []
        if(selected)
            this.setSelectedNetwork(selected)
    }

    getSelectedNetwork(): Promise<Network> {
        return new Promise((resolve, reject) => { resolve(this.selectedNetwork as Network) })
    }

    setSelectedNetwork(networkToSelect: Network, storage = chrome.storage): Promise<void> {
        return new Promise((resolve, reject) => {
            let found = this.networks.filter((network: Network) => network.name === networkToSelect.name)
            if(found.length == 1) {
                this.selectedNetwork = found[0]
                storage.local.set({ "network": JSON.stringify(this.selectedNetwork) }, () => {
                    const error = chrome.runtime.lastError;
                    if (error) return reject(error)
                    resolve()
                });
            }
            resolve()
        })
    }

    addNetwork(networkToAdd: Network): Promise<Network> {
        return new Promise(resolve => {
            this.networks.push(networkToAdd)
            resolve(networkToAdd)
        })
    }

    getNetwork(name: string): Promise<Network[]> {
        return new Promise(resolve => {
            resolve(this.networks.filter(network => network.name === name))
        })
    }
}