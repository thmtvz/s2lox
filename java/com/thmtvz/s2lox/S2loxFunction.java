package com.thmtvz.s2lox;

import java.util.List;

class S2loxFunction implements S2loxCallable{
    
    private final Stmt.Function declaration;
    private final Environment closure;
    private final boolean isInitializer;

    S2loxFunction(Stmt.Function declaration, Environment closure, boolean isInitializer){
	this.isInitializer = isInitializer;
	this.closure = closure;
	this.declaration = declaration;
    }

    S2loxFunction bind(S2loxInstance instance){
	Environment environment = new Environment(closure);
	environment.define("this", instance);
	return new S2loxFunction(declaration, environment, isInitializer);
    }
    
    @Override
    public Object call(Interpreter interpreter, List<Object> arguments){
	Environment environment = new Environment(closure);
	for(int i = 0; i < declaration.params.size(); ++i){
	    environment.define(declaration.params.get(i).lexeme, arguments.get(i));
	}

	try{
	    interpreter.executeBlock(declaration.body, environment);
	} catch (Return returnValue){
	    if(isInitializer) return closure.getAt(0, "this");
	    return returnValue.value;
	}
	if(isInitializer) return closure.getAt(0, "this");
	return null;
    }

    @Override
    public int arity(){
	return declaration.params.size();
    }

    @Override
    public String toString(){
	return "<fun " + declaration.name.lexeme + ">";
    }
}
