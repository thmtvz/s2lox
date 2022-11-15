import tokenType from "./tokenType";

export default class token{
    readonly type: tokenType;
    readonly lexeme: string;
    readonly literal: any;
    readonly line: number;

    constructor(t, le, li, ln){
	this.type = t;
	this.lexeme = le;
	this.literal = li;
	this.line = ln;
    }
    
    public toString(): string{
	return "{token: " + "}";
    }
}
