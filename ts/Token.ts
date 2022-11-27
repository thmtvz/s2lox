import TokenType from "TokenType";

export default class Token{
    constructor(
	readonly t: TokenType,
	readonly lexeme: string,
	readonly literal: any,
	readonly line: number
    ) {}

    public toString(): string{
	return "{token: " + "}";
    }
}
