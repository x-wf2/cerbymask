import Key from "./key";

export class Wallet {
    password?: string;
    key?: Key;
    unlocked: Boolean;

    constructor() { this.unlocked = false }

    static newKey() {
        return new Key()
    }
}