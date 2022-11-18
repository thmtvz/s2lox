import Token from "Token";

export default class RuntimeError extends Error{
    constructor(
	readonly token: Token,
	string message, 
    ){
	super(message);
    }
}
