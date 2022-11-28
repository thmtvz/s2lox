import TokenType from "./TokenType.js";
import S2ltype from "./S2ltype.js";

export default class Token{
    constructor(
	readonly t: TokenType,
	readonly lexeme: string,
	readonly literal: S2ltype,
	readonly line: number
    ) {}

    public toString(): string{
	return "{token: " + "}";
    }
}
