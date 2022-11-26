import { FunctionStmt } from "Stmt";
import S2ltype from "S2ltype";
import Environment from "Environment";
import S2loxInstance from "S2loxInstance";
import S2loxCallable from "S2loxCallable";
import Interpreter from "Interpreter";
import Return from "Return";

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
