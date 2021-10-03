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

test('it should call factory new wallet', async () => {
    await provider.newWallet()
    expect(factory.newWallet).toBeCalledTimes(1)
});

test('it should call factory get wallet', async () => {
    await provider.getWallet()
    expect(factory.getWallet).toBeCalledTimes(1)
});

test('it should call factory save wallet', async () => {
    const ks = {} as KeystoreT
    const wallet = new Wallet()
    await provider.saveWallet(ks, wallet)
    expect(factory.saveWallet).toBeCalledTimes(1)
});
