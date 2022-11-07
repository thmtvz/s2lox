package com.thmtvz.s2lox;

class RuntimeError extends RuntimeException{
    final Token token;

    RuntimeError(Token tok, String message){
	super(message);
	this.token = tok;
    }
}
