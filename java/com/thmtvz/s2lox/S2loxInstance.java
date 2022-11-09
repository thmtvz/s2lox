package com.thmtvz.s2lox;

import java.util.HashMap;
import java.util.Map;

class S2loxInstance{

    private S2loxClass klass;
    private final Map<String, Object> fields = new HashMap<>();

    S2loxInstance(S2loxClass klass){
	this.klass = klass;
    }
    
    @Override
    public String toString(){
	return "<instance " + this.klass.toString() + ">";
    }

    public Object get(Token name){
	if(fields.containsKey(name.lexeme)){
	    return fields.get(name.lexeme);
	}

	S2loxFunction method = klass.findMethod(name.lexeme);
	if(method != null) return method.bind(this);

	throw new RuntimeError(name, "Undefined property '" + name.lexeme + "'.");
    }

    void set(Token name, Object value){
	fields.put(name.lexeme, value);
    }
}
