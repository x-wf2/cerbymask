import { WalletT as RadixWalletT, AccountT } from "@radixdlt/application";
import Key from "./key";
import { Network } from "./network";

export type WalletBalanceT = Readonly<{
    address: string,
    balance: string,
    xrd?: any;
}>

export type WalletTokensT = Readonly<{
    address: string,
    tokens: [any],
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

    currency: string;
    addresses: number;
    selectedAddress: number;

    radixWallet?: RadixWalletT;
    radixPublicAddresses: AccountT[];
    radixBalances: WalletBalanceT[];
    radixStakes: WalletStakeT[];
    radixTokens: WalletTokensT[];

    network?: Network;

    constructor() { 
        this.unlocked = false;
        this.selectedAddress = 0;
        this.addresses = 2;

        this.radixPublicAddresses = []
        this.radixBalances = []
        this.radixStakes = []
        this.radixTokens = []
        this.currency = "USD"
    }

    static newKey() {
        return new Key()
    }

    static newKeyWithMnemonic(mnemonic: string) {
        return new Key(mnemonic)
    }
}