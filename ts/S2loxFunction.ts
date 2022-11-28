import { FunctionStmt } from "./Stmt.js";
import S2ltype from "./S2ltype.js";
import Environment from "./Environment.js";
import S2loxInstance from "./S2loxInstance.js";
import S2loxCallable from "./S2loxCallable.js";
import Interpreter from "./Interpreter.js";
import Return from "./Return.js";

export default class S2loxFunction implements S2loxCallable{

    constructor(
	private readonly isInitializer: boolean,
	private readonly closure: Environment,
	private readonly declaration: FunctionStmt,
    ) {}

    public bind(instance: S2loxInstance): S2loxFunction{
	let environment = new Environment(this.closure);
	environment.define("this", instance);
	return new S2loxFunction(this.isInitializer, environment,
				 this.declaration);
    }

    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
	let environment = new Environment(this.closure);
	for(let i = 0; i < this.declaration.params.length; ++i){
	    environment.define(this.declaration.params[i].lexeme,
			       args[i]);
	}

	try{
	    interpreter.executeBlock(this.declaration.body, environment);
	} catch(returnValue){
	    if(returnValue instanceof Return){
		if(this.isInitializer) return this.closure.getAt(0, "this");
		return returnValue.value;
	    }
	}
	if(this.isInitializer) return this.closure.getAt(0, "this");
	return null;
    }

    public arity(){
	return this.declaration.params.length;
    }
    
    public toString(){
	return `<fun ${this.declaration.name.lexeme}>`;
    }
}
