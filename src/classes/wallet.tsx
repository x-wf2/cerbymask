import { AccountAddressT } from "@radixdlt/account";
import { WalletT as RadixWalletT, Wallet as RadixWallet, AccountT } from "@radixdlt/application";
import Key from "./key";

export type WalletBalanceT = Readonly<{
    address: string,
    balance: string,
    xrd?: any;
}>

export type WalletTokensT = Readonly<{
    address: string,
    tokens: [],
}>

export type WalletStakeT = Readonly<{
    address: string,
    initial: string,
    rewards: string,
    unstaking: string,
    staked: string;
    balance: string;
}>

export class Wallet {
    key?: Key;
    unlocked: Boolean;
    password?: string;

    addresses: number;
    selectedAddress: number;

    radixWallet?: RadixWalletT;
    radixPublicAddresses: AccountT[];
    radixBalances: WalletBalanceT[];
    radixStakes: WalletStakeT[];
    radixTokens: WalletTokensT[];

    constructor() { 
        this.unlocked = false;
        this.selectedAddress = 0;
        this.addresses = 2;

        this.radixPublicAddresses = []
        this.radixBalances = []
        this.radixStakes = []
        this.radixTokens = []
    }

    static newKey() {
        return new Key()
    }

    static newKeyWithMnemonic(mnemonic: string) {
        return new Key(mnemonic)
    }
}