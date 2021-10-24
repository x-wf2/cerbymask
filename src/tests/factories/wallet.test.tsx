import React from 'react';
import { Wallet } from '../../classes/wallet';
import LocalWalletFactory from '../../factories/wallet';
import { LocalProvider, Provider } from '../../providers/local';
import { KeystoreT } from '@radixdlt/crypto'
import NetworkFactory from '../../factories/network';

const get = jest.fn()
const set = jest.fn()
let chrome = {
    storage: {
        local: {
            set,
            get
        }
    }
}

let networkFactory: NetworkFactory;
let factory: LocalWalletFactory;
let provider: LocalProvider;

beforeAll(() => {
    factory = new LocalWalletFactory()
    networkFactory = new NetworkFactory()
    provider = new LocalProvider(networkFactory, factory)
})

test('it should call factory get wallet', async () => {
});
