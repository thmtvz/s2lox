package com.thmtvz.s2lox;

class Return extends RuntimeException{
    Object value = null;
    Return(Object value){
	super(null, null, false, false);
	this.value = value;
    }
}
