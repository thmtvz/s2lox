package com.thmtvz.s2lox;

import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

import static com.thmtvz.s2lox.TokenType.*;

class Parser{

    private static class ParseError extends RuntimeException {}

    private final List<Token> tokens;
    private int current = 0;

    Parser(List<Token> tokens){
	this.tokens = tokens;
    }

    public List<Stmt> parse(){
	List<Stmt> statements = new ArrayList<>();
	while(!isAtEnd()){
	    statements.add(declaration());
	}
	return statements;
    }

    private Stmt declaration(){
	try{
	    if(match(CLASS)) return classDeclaration();
	    if(match(FUN)) return function("function");
	    if(match(VAR)) return varDeclaration();
	    
	    return statement();
	} catch (ParseError e){
	    synchronize();
	    return null;
	}
    }

    private Stmt classDeclaration(){
	Token name = consume(IDENTIFIER, "Expecter class name.");

	Expr.Variable superClass = null;
	if(match(LESS)){
	    consume(IDENTIFIER, "Expected superclass name.");
	    superClass = new Expr.Variable(previous());
	}
	consume(LEFT_BRACE, "Expected '{' before class body.");

	List<Stmt.Function> methods = new ArrayList<>();
	while(!check(RIGHT_BRACE) && !isAtEnd()){
	    methods.add(function("method"));
	}
	consume(RIGHT_BRACE, "Expected closing '}' after class body.");

	return new Stmt.Class(name, superClass, methods);
    }

    private Stmt.Function function(String kind){
	Token name = consume(IDENTIFIER, "Expect " + kind + " name.");
	consume(LEFT_PAREN, "Expect '(' after" + kind + " name.");
	List<Token> parameters = new ArrayList<>();
	if(!check(RIGHT_PAREN)){
	    do {
		if(parameters.size() >= 255) {
		    error(peek(), "Can't have more than 255 parameters.");
		}
		parameters.add(consume(IDENTIFIER, "Expected parameter name."));
	    } while(match(COMMA));
	}
	consume(RIGHT_PAREN, "Expected ')' after parameters");
	consume(LEFT_BRACE, "Expected '{' before " + kind + " body.");
	List<Stmt> body = block();
	return new Stmt.Function(name, parameters, body);
    }

    private Stmt varDeclaration(){
	Token name = consume(IDENTIFIER, "Expected variable name.");

	Expr initializer = null;
	if(match(EQUAL)){
	    initializer = expression();
	}
	
	consume(SEMICOLON, "Expected ';' after variable declaration");
	return new Stmt.Var(name, initializer);
    }

    private Stmt statement(){
	if(match(IMPORT)) return importStatement();
	if(match(FOR)) return forStatement();
	if(match(IF)) return ifStatement();
	if(match(PRINT)) return printStatement();
	if(match(RETURN)) return returnStatement();
	if(match(WHILE)) return whileStatement();
	if(match(LEFT_BRACE)) return new Stmt.Block(block());
	return expressionStatement();
    }

    private Stmt importStatement(){
	Token name = consume(STRING, "Expected string for module name.");
	consume(SEMICOLON, "Expected ';' after import statement");

	return new Stmt.Import(name);
    }

    private Stmt forStatement(){
	consume(LEFT_PAREN, "Expected '(' after 'for'.");
	Stmt initializer;
	if(match(SEMICOLON)){
	    initializer = null;
	} else if(match(VAR)){
	    initializer = varDeclaration();
	} else {
	    initializer = expressionStatement();
	}

	Expr condition = null;
	if(!check(SEMICOLON)){
	    condition = expression();
	}
	consume(SEMICOLON, "Expected ';' after loop condition.");

	Expr increment = null;
	if(!check(RIGHT_PAREN)){
	    increment = expression();
	}
	consume(RIGHT_PAREN, "Expected ')' after for clauses.");

	Stmt body = statement();
	
	if(increment != null){
	    body = new Stmt.Block(Arrays.asList(body, new Stmt.Expression(increment)));
	}
	if(condition == null) condition = new Expr.Literal(true);
	body = new Stmt.While(condition, body);

	if(initializer != null){
	    body = new Stmt.Block(Arrays.asList(initializer, body));
	}

	return body;
    }

    private Stmt ifStatement(){
	consume(LEFT_PAREN, "Expected '(' after 'if'.");
	Expr condition = expression();
	consume(RIGHT_PAREN, "Expected ')' after if condition.");

	Stmt thenBranch = statement();
	Stmt elseBranch = null;
	if(match(ELSE)){
	    elseBranch = statement();
	}
	
	return new Stmt.If(condition, thenBranch, elseBranch);
    }

    private Stmt printStatement(){
	Expr value = expression();
	consume(SEMICOLON, "Expected ';' after value");
	return new Stmt.Print(value);
    }

    private Stmt returnStatement(){
	Token keyword = previous();
	Expr value = null;
	if(!check(SEMICOLON)){
	    value = expression();
	}
	
	consume(SEMICOLON, "Expected ';' after return value.");
	return new Stmt.Return(keyword, value);
    }

    private Stmt whileStatement(){
	consume(LEFT_PAREN, "Expected '(' after 'while'.");
	Expr condition = expression();
	consume(RIGHT_PAREN, "Expected ')' after condition.");
	Stmt body = statement();

	return new Stmt.While(condition, body);
    }
    
    private List<Stmt> block(){
	List<Stmt> statements = new ArrayList<>();

	while(!check(RIGHT_BRACE) && !isAtEnd()){
	    statements.add(declaration());
	}

	consume(RIGHT_BRACE, "Expected '}' after block");
	return statements;
    }

    private Stmt expressionStatement(){
	Expr expr = expression();
	consume(SEMICOLON, "Expected ';' after expression");
	return new Stmt.Expression(expr);
    }

    private void synchronize(){
	advance();

	while(!isAtEnd()){
	    if(previous().type == SEMICOLON) return;

	    switch(peek().type){
	    case CLASS:
	    case FUN:
	    case VAR:
	    case FOR:
	    case IF:
	    case WHILE:
	    case PRINT:
	    case RETURN:
		return;
	    }

	    advance();
	}
    }

    private Expr expression(){
	return assignment();
    }
    
    private Expr assignment(){
	Expr expr = or();

	if(match(EQUAL)){
	    Token equals = previous();
	    Expr value = assignment();

	    if(expr instanceof Expr.Variable){
		Token name = ((Expr.Variable)expr).name;
		return new Expr.Assign(name, value);
	    } else if(expr instanceof Expr.Get){
		Expr.Get get = (Expr.Get)expr;
		return new Expr.Set(get.object, get.name, value);
	    }

	    error(equals, "Invalid assignment target.");
	}
	return expr;
    }

    private Expr or(){
	Expr expr = and();

	while(match(OR)){
	    Token operator = previous();
	    Expr right = and();
	    expr = new Expr.Logical(expr, operator, right);
	}
	return expr;
    }

    private Expr and(){
	Expr expr = equality();

	while(match(AND)){
	    Token operator = previous();
	    Expr right = equality();
	    expr = new Expr.Logical(expr, operator, right);
	}
	
	return expr;
    }

    private Expr equality(){
	Expr expr = comparison();
	
	while(match(BANG_EQUAL, EQUAL_EQUAL)){
	    Token operator = previous();
	    Expr rigth = comparison();
	    expr = new Expr.Binary(expr, operator, rigth);
	}
	return expr;
    }

    private Expr comparison(){
	Expr expr = term();

	while(match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL)){
	    Token operator = previous();
	    Expr right = term();
	    expr = new Expr.Binary(expr, operator, right);
	}
	
	return expr;
    }

    private Expr term(){
	Expr expr = factor();

	while(match(MINUS, PLUS)){
	    Token operator = previous();
	    Expr right = factor();
	    expr = new Expr.Binary(expr, operator, right);
	}
	
	return expr;
    }

    private Expr factor(){
	Expr expr = unary();

	while(match(SLASH, STAR)){
	    Token operator = previous();
	    Expr right = unary();
	    expr = new Expr.Binary(expr, operator, right);
	}

	return expr;  
    }

    private Expr unary(){
	if(match(BANG, MINUS)){
	    Token operator = previous();
	    Expr right = unary();
	    return new Expr.Unary(operator, right);
	}
	return call();
    }

    private Expr call() {
	Expr expr = primary();

	while(true){
	    if(match(LEFT_PAREN)){
		expr = finishCall(expr);
	    } else if(match(DOT)){
		Token name = consume(IDENTIFIER, "Expected property name after '.'.");
		expr = new Expr.Get(expr, name);
	    } else {
		break;
	    }
	}

	return expr;
    }

    private Expr finishCall(Expr callee){
	List<Expr> arguments = new ArrayList<>();
	if(!check(RIGHT_PAREN)){
	    do{
		if(arguments.size() >= 255){
		    error(peek(), "Can't have more than 255 arguments.");
		}
		arguments.add(expression());
	    } while(match(COMMA));
	}

	Token paren = consume(RIGHT_PAREN, "Expected ')' after argumets.");

	return new Expr.Call(callee, paren, arguments);
    }

    private Expr primary(){
	if(match(FALSE)) return new Expr.Literal(false);
	if(match(TRUE)) return new Expr.Literal(true);
	if(match(NIL)) return new Expr.Literal(null);

	if(match(NUMBER, STRING)){
	    return new Expr.Literal(previous().literal);
	}
	
	if(match(SUPER)){
	    Token keyword = previous();
	    consume(DOT, "Expected '.' after 'super'");
	    Token method = consume(IDENTIFIER, "Expected superclass method name.");
	    return new Expr.Super(keyword, method);
	}
	if(match(THIS)) return new Expr.This(previous());

	if(match(IDENTIFIER)){
	    return new Expr.Variable(previous());
	}

	if(match(LEFT_PAREN)){
	    Expr expr = expression();
	    consume(RIGHT_PAREN, "Expect ')' after expression");
	    return new Expr.Grouping(expr);
	}

	throw error(peek(), "Expected expression");
    }

    private boolean check(TokenType type){
	if(isAtEnd()) return false;
	return peek().type == type;
    }

    private Token advance(){
	if(!isAtEnd()) current++;
	return previous();
    }

    private boolean isAtEnd(){
	return peek().type == EOF;
    }

    private Token peek(){
	return tokens.get(current);
    }

    private Token previous(){
	return tokens.get(current - 1);
    }

    private Token consume(TokenType type, String message){
	if(check(type)) return advance();

	throw error(peek(), message);
    }
    
    private ParseError error(Token token, String message){
	S2lox.error(token, message);
	return new ParseError();
    }

    private boolean match(TokenType... types){
	for(TokenType type : types){
	    if(check(type)){
		advance();
		return true;
	    }
	}
	return false;  
    }
}
