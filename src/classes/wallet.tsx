import { AccountAddressT } from "@radixdlt/account";
import { WalletT as RadixWalletT, Wallet as RadixWallet, AccountT } from "@radixdlt/application";
import Key from "./key";

export class Wallet {
    key?: Key;
    unlocked: Boolean;
    password?: string;

    radixWallet?: RadixWalletT;
    radixPublicAddresses?: AccountT[];

    constructor() { this.unlocked = false;}

    static newKey() {
        return new Key()
    }

    static newKeyWithMnemonic(mnemonic: string) {
        return new Key(mnemonic)
    }
}