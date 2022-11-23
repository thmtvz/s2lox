interface s<T> {
    empty(): boolean;
    peek(): T | null;
    pop(): T | undefined;
    push(item: T): void;
    get(index: number): T;
    size(): number;
}

export default class Stack<T> implements s<T>{

    private s: T[] = [];

    constructor() {}
    
    public empty(): boolean{
	return this.s.length === 0;
    }

    public peek(): T | null{
	if(this.empty()) return null;
	return this.s[this.s.length - 1];
    }

    public pop(): T | undefined{
	return this.s.pop();
    }

    public push(item: T): void{
	this.s.push(item);
	return;
    }

    public get(index: number): T{
	return this.s[index];
    }

    public size(): number{
	return this.s.length;
    }
}
