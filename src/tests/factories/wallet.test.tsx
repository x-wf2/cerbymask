import React from 'react';
import { Wallet } from '../../classes/wallet';
import LocalWalletFactory from '../../factories/wallet';
import { LocalProvider, Provider } from '../../providers/local';
import { KeystoreT } from '@radixdlt/crypto'

jest.mock('../../factories/wallet.tsx')

let factory: LocalWalletFactory;
let provider: LocalProvider;

beforeEach(() => {
    factory = new LocalWalletFactory()
    provider = new LocalProvider(factory)
})

test('it should save a local wallet', async () => {
});
