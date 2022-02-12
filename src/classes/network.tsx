
export class Network {
    
    name: string;
    url: string;
    xrd_rri?: string;

    constructor(name: string, url: string, xrd_rri?: string) { 
        this.name = name
        this.url = url
        if(xrd_rri)
            this.xrd_rri = xrd_rri
    }
}