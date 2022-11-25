import RuntimeError from "RuntimeError";
import Token from "Token";
import S2ltype from "S2ltype";

export default class Environment{
    
    public readonly enclosing: Environment | null;
    private readonly values: Map<String, S2ltype> = new Map();

    constructor(enclosing?: Environment){
	if(enclosing){
	    this.enclosing = enclosing;
	    return;
	}
	this.enclosing = null;
    }
    
    public define(name: string, value: S2ltype): void{
	this.values.set(name, value);
	return;
    }

    public ancestor(distance: number): Environment{
	let env: Environment = this;
	for(let i = 0; i < distance; ++i){
	    if(env.enclosing === null) break; //🧐🧐
	    env = env.enclosing;
	}
	return env;
    }
    
    public getAt(distance: number, name: string): S2ltype{
	let value = this.ancestor(distance).values.get(name);
	if(value === undefined) value = null; //🧐🧐
	return value;
    }

    public assignAt(distance: number, name: Token, value: S2ltype): void{
	this.ancestor(distance).values.set(name.lexeme, value);
    }

    public get(name: Token): S2ltype{
	if(this.values.has(name.lexeme)){
	    let value = this.values.get(name.lexeme);
	    if(value === undefined) value = null;
	    return value; //🧐🧐
	}

	if(this.enclosing !== null) return this.enclosing.get(name);

	throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
    }
    
    public assign(name: Token, value: S2ltype): void{
	if(this.values.has(name.lexeme)){
	    this.values.set(name.lexeme, value);
	    return;
	}

	if(this.enclosing !== null){
	    this.enclosing.assign(name, value);
	    return;
	}
	
	throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
    }

}
