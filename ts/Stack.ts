interface s<T> {
    empty(): boolean;
    peek(): T | null;
    pop(): T;
    push(item: T): void;
    get(index: number): T;
}

export default class Stack<T> implements s<T>{
    constructor(
	private s: T[];
    ) {}
    
    public empty(): boolean{
	return this.s.length === 0;
    }

    public peek(): T | null{
	if(this.empty()) return null;
	return this.s[this.s.length - 1];
    }

    public pop(): T{
	return this.s.pop();
    }

    public push(item: T): void{
	this.s.push(item);
	return;
    }

    public get(index: number): T{
	return t.s[index];
    }
}
