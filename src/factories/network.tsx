import { Network } from "../classes/network";

export const NETWORKS = {
    "mainnet": new Network("mainnet", "https://mainnet.radixdlt.com/", "xrd_rr1qy5wfsfh"),
    "stokenet": new Network("stokenet", "https://stokenet.radixdlt.com/", "xrd_tr1qyf0x76s")
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
                storage.local.set({ "network": this.selectedNetwork }, () => {
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