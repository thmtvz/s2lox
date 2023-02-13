package com.thmtvz.s2lox;

import java.util.List;
import java.util.Map;

class S2loxClass implements S2loxCallable {
    
    final String name;
    final S2loxClass superClass; 
    private final Map<String, S2loxFunction> methods;
    
    S2loxClass(String name, S2loxClass superClass, Map<String, S2loxFunction> methods){
	this.superClass = superClass;
	this.name = name;
	this.methods = methods;
    }

    S2loxFunction findMethod(String name){
	if(methods.containsKey(name)){
	    return methods.get(name);
	}

	if(superClass != null){
	    return superClass.findMethod(name);
	}

	return null;
    }

    @Override
    public String toString(){
	return "<class " + this.name + ">";
    }
    
    @Override
    public int arity(){
	S2loxFunction initializer = findMethod("init");
	if(initializer == null) return 0;
	return initializer.arity();
    }
    
    @Override
    public Object call(Interpreter interpreter, List<Object> arguments){
	S2loxInstance instance = new S2loxInstance(this);
	S2loxFunction initializer = findMethod("init");
	if(initializer != null){
	    initializer.bind(instance).call(interpreter, arguments);
	}
	return instance;
    }
}
