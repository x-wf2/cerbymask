import React from 'react';
import { Wallet } from '../../classes/wallet';
import LocalWalletFactory from '../../factories/wallet';
import { LocalProvider, Provider } from '../../providers/local';
import { KeystoreT } from '@radixdlt/crypto'
import NetworkFactory from '../../factories/network';
import { Network } from '../../classes/network';

const get = jest.fn()
const set = jest.fn()
let chrome = {
    storage: {
        local: {
            set: set,
            get: get,
        }
    }
}

let networkFactory: NetworkFactory;
let walletFactory: LocalWalletFactory;
let localProvider: LocalProvider;

let testnet = new Network("TESTNET", "https://testnet.com")

beforeAll(() => {
    walletFactory = new LocalWalletFactory()
    networkFactory = new NetworkFactory([testnet])
    localProvider = new LocalProvider(networkFactory, walletFactory)
})

test('it should save the network on chrome storage 2', async () => {
    networkFactory.setSelectedNetwork(testnet, chrome as any)
});
