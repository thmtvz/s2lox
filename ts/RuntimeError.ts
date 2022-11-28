import Token from "./Token.js";

export default class RuntimeError extends Error{
    constructor(
	readonly token?: Token,
	message?: string,
    ){
	super(message);
    }
}
