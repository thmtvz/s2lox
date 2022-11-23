interface m{
    size(): number;
    isEmpty(): boolean;
    get(key: string): boolean | undefined;
    put(key: string, value: boolean): void;
    remove(key: string): boolean | undefined;
    contains(key: string): boolean;
}

type p = {[k: string]: boolean}

export default class Mp implements m{
    
    private m: p = {};
    private s = 0;

    constructor() {}

    public size(): number{
	return this.s;
    }

    public isEmpty(): boolean{
	return this.s === 0;
    }

    public get(key: string): boolean{
	return this.m[key];
    }

    public put(key: string, value: boolean): void{
	if(!this.m[key]) this.s++;
	this.m[key] = value;
	return;
    }

    public remove(key: string): boolean | undefined{
	const old = this.m[key];
	if(old === undefined) return undefined;
	delete this.m[key];
	this.s--;
	return old;
    }

    public contains(key: string): boolean{
	if(this.m[key] !== undefined) return true;
	return false;
    }
}
