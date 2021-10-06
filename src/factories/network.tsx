import { Wallet } from "../classes/wallet"
import { KeystoreT } from '@radixdlt/crypto'
import { SigningKeychainT } from "@radixdlt/account";
import { Network } from "../classes/network";

export interface NetworkFactoryInterface {
    newNetwork(name: string, url: string): Promise<Network>;
    getNetwork(name: string): Promise<Network[]>;
}

export default class NetworkFactory implements NetworkFactoryInterface {
    networks: Network[];

    constructor() {
        this.networks = []
    }

    newNetwork(name: string, url: string): Promise<Network> {
        return new Promise(resolve => {
            const network = new Network(name, url)
            this.networks.push(network)
            resolve(network)
        })
    }
    getNetwork(name: string): Promise<Network[]> {
        return new Promise(resolve => {
            resolve(this.networks.filter(network => network.name === name))
        })
    }
}