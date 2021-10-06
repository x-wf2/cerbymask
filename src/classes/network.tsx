import { AccountAddressT } from "@radixdlt/account";

export class Network {
    
    name: string;
    url: string;

    constructor(name: string, url: string) { 
        this.name = name
        this.url = url
    }
}