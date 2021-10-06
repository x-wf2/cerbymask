import { KeystoreT } from '@radixdlt/application';
import { MnemomicT, Mnemonic } from '@radixdlt/crypto'

export default class Key {
    mnemonic: MnemomicT;
    keystore?: KeystoreT;

    constructor(mnemonic?: string) {
        this.mnemonic = Mnemonic.generateNew()
        if (mnemonic) {
            let result = Mnemonic.fromEnglishPhrase(mnemonic)

            if (result.isOk())
                this.mnemonic = result.value

            if (result.isErr())
                this.mnemonic = {} as MnemomicT
        }
    }
}