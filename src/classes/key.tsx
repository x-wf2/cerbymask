import { KeystoreT } from '@radixdlt/application';
import { MnemomicT, Mnemonic } from '@radixdlt/crypto'

export default class Key {
    mnemonic: MnemomicT;
    keystore?: KeystoreT;

    constructor() {
        this.mnemonic = Mnemonic.generateNew()
    }
}