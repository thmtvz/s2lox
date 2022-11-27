import RuntimeError from "RuntimeError";
import S2loxFunction from "S2loxFunction";
import S2loxClass from "S2loxClass";
import S2ltype from "S2ltype";
import Token from "Token";

export default class S2loxInstance{

    private readonly fields = new Map<string, S2ltype>();

    constructor(
	private klass: S2loxClass,
    ) {}

    public toString(): string{
	return `<instance ${this.klass.toString()}>`;
    }

    public get(name: Token): S2ltype{
	if(this.fields.has(name.lexeme)){
	    let r = this.fields.get(name.lexeme);
	    if(r === undefined) return null;
	    return r;
	}

	let method = this.klass.findMethod(name.lexeme);
	if(method != null) return method.bind(this);

	throw new RuntimeError(name, `Undefined property ${name.lexeme}.`);
    }

    public set(name: Token, value: S2ltype){
	this.fields.set(name.lexeme, value);
    }
}
