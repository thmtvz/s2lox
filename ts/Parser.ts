import TokenType from "./TokenType.js";
import Token from "./Token.js";
import Runner from "./Runner.js";
import RuntimeError from "./RuntimeError.js";
import { Expr } from "./Expr.js";
import { AssignExpr } from "./Expr.js";
import { BinaryExpr } from "./Expr.js";
import { CallExpr } from "./Expr.js";
import { GetExpr } from "./Expr.js";
import { GroupingExpr } from "./Expr.js";
import { LiteralExpr } from "./Expr.js";
import { SetExpr } from "./Expr.js";
import { SuperExpr } from "./Expr.js";
import { ThisExpr } from "./Expr.js";
import { LogicalExpr } from "./Expr.js";
import { UnaryExpr } from "./Expr.js";
import { VariableExpr } from "./Expr.js";
import { Stmt } from "./Stmt.js";
import { NoopStmt } from "./Stmt.js";
import { ImportStmt } from "./Stmt.js";
import { BlockStmt } from "./Stmt.js";
import { ClassStmt } from "./Stmt.js";
import { ExpressionStmt } from "./Stmt.js";
import { FunctionStmt } from "./Stmt.js";
import { IfStmt } from "./Stmt.js";
import { PrintStmt } from "./Stmt.js";
import { ReturnStmt } from "./Stmt.js";
import { VarStmt } from "./Stmt.js";
import { WhileStmt } from "./Stmt.js";

class ParseError extends RuntimeError {}

export default class Parser{

    private current = 0;

    constructor(
	private readonly runner: Runner,
	private readonly tokens: Token[],
    ) {}
    
    public parse(): Stmt[]{
	const statements = [];
	while(!this.isAtEnd())
	    statements.push(this.declaration());
	return statements;
    }

    private declaration(): Stmt{
	try{
	    if(this.match(TokenType.CLASS)) return this.classDeclaration();
	    if(this.match(TokenType.FUN)) return this.fn("function");
	    if(this.match(TokenType.VAR)) return this.varDeclaration();
	    
	    return this.statement();
	} catch(e){
	    if(e instanceof ParseError)
		this.synchronize();
	    return new NoopStmt();
	}
    } 

    private classDeclaration(): Stmt{
	let name = this.consume(TokenType.IDENTIFIER, "Expected class name.");
	
	let superClass: VariableExpr | null = null;
	if(this.match(TokenType.LESS)){
	    this.consume(TokenType.IDENTIFIER, "Expected superclass name.");
	    superClass = new VariableExpr(this.previous());
	}
	this.consume(TokenType.LEFT_BRACE, "Expected '{' before class body.");

	const methods: FunctionStmt[] = [];
	while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd())
	    methods.push(this.fn("method"));

	this.consume(TokenType.RIGHT_BRACE, "Expected closing '}' after class body.");

	return new ClassStmt(name, superClass, methods);
    }

    private fn(kind: string): FunctionStmt{
	const name: Token = this.consume(TokenType.IDENTIFIER, "Expected " + kind + " name.");
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after " + kind + " name.");
	const parameters: Token[] = [];
	if(!this.check(TokenType.RIGHT_PAREN)){
	    do{
		if(parameters.length >= 255){
		    this.error(this.peek(), "Can't have more than 255 parameters.");
		}
		parameters.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name."));
	    } while(this.match(TokenType.COMMA));
	}
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameters");
	this.consume(TokenType.LEFT_BRACE, "Expected '{' before " + kind + " body.");

	const body: Stmt[] = this.block();
	return new FunctionStmt(name, parameters, body);
   }
    
    private varDeclaration(): Stmt{
	const name: Token = this.consume(TokenType.IDENTIFIER, "Expected variable name.");

	let initializer: Expr | null = null;
	if(this.match(TokenType.EQUAL)){
	    initializer = this.expression();
	}

	this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration");
	return new VarStmt(name, initializer);
    }

    private statement(): Stmt{
	if(this.match(TokenType.NOOP)) return this.noopStatement();
	if(this.match(TokenType.IMPORT)) return this.importStatement();
	if(this.match(TokenType.FOR)) return this.forStatement();
	if(this.match(TokenType.IF)) return this.ifStatement();
	if(this.match(TokenType.PRINT)) return this.printStatement();
	if(this.match(TokenType.RETURN)) return this.returnStatement();
	if(this.match(TokenType.WHILE)) return this.whileStatement();
	if(this.match(TokenType.LEFT_BRACE)) return new BlockStmt(this.block());
	return this.expressionStatement();

    }

    private noopStatement(): Stmt{
	this.consume(TokenType.SEMICOLON, "Expected ';' after noop statement");
	
	return new NoopStmt();
    }

    private importStatement(): Stmt{
	const name = this.consume(TokenType.STRING, "Expected module name.");
	this.consume(TokenType.SEMICOLON, "Expected ';' after import statement");

	return new ImportStmt(name);
    }

    private forStatement(): Stmt{
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'for'.");
	let initializer: Stmt | null;
	if(this.match(TokenType.SEMICOLON)){
	    initializer = null;
	} else if(this.match(TokenType.VAR)){
	    initializer = this.varDeclaration();
	} else {
	    initializer = this.expressionStatement();
	}

	let condition: Expr | null = null;
	if(!this.check(TokenType.SEMICOLON)){
	    condition = this.expression();
	}
	this.consume(TokenType.SEMICOLON, "Expected ';' after loop condition.");

	let increment: Expr | null = null;
	if(!this.check(TokenType.RIGHT_PAREN)){
	    increment = this.expression();
	}
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after for clauses.");

	let body: Stmt = this.statement();
	
	if(increment != null){
	    body = new BlockStmt([body, new ExpressionStmt(increment)]);
	}
	if(condition == null) condition = new LiteralExpr(true);
	body = new WhileStmt(condition, body);

	if(initializer != null){
	    body = new BlockStmt([initializer, body]);
	}

	return body;
    }

    private ifStatement(): Stmt{
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'if'.");
	const condition: Expr = this.expression();
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after if condition.");

	const thenBranch: Stmt = this.statement();
	let elseBranch: Stmt | null = null;
	if(this.match(TokenType.ELSE)){
	    elseBranch = this.statement();
	}
	
	return new IfStmt(condition, thenBranch, elseBranch);
    }

    private printStatement(): Stmt{
	const value: Expr = this.expression();
	this.consume(TokenType.SEMICOLON, "Expected ';' after value");
	return new PrintStmt(value);
    }

    private returnStatement(): Stmt{
	const keyword = this.previous();
	let value: Expr | null = null;
	if(!this.check(TokenType.SEMICOLON)){
	    value = this.expression();
	}
	
	this.consume(TokenType.SEMICOLON, "Expected ';' after return value.");
	return new ReturnStmt(keyword, value);
    }

    private whileStatement(): Stmt{
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'while'.");
	const condition: Expr = this.expression();
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after condition.");
	const body: Stmt = this.statement();

	return new WhileStmt(condition, body);
    }

    private block(): Stmt[]{
	const statements: Stmt[] = [];

	while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()){
	    statements.push(this.declaration());
	}

	this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block");
	return statements;
    }

    private expressionStatement(): Stmt{
	const expr: Expr = this.expression();
	this.consume(TokenType.SEMICOLON, "Expected ';' after expression");
	return new ExpressionStmt(expr);
    }

    private synchronize(): void{
	this.advance();

	while(!this.isAtEnd()){
	    if(this.previous().t == TokenType.SEMICOLON) return;

	    switch(this.peek().t){
		case TokenType.CLASS:
		case TokenType.FUN:
		case TokenType.VAR:
		case TokenType.FOR:
		case TokenType.IF:
		case TokenType.WHILE:
		case TokenType.PRINT:
		case TokenType.RETURN:
		case TokenType.IMPORT:
		    return;
	    }

	    this.advance();
	}
    }
    
    private expression(): Expr{
	return this.assignment();
    }

    private assignment(): Expr{
	let expr: Expr = this.or();
	
	if(this.match(TokenType.EQUAL)){
	    const equals: Token = this.previous();
	    const value: Expr = this.assignment();

	    if(expr instanceof VariableExpr){
		const name: Token = expr.name;
		return new AssignExpr(name, value);
	    } else if(expr instanceof GetExpr){
		const g: GetExpr = expr;
		return new SetExpr(g.obj, g.name, value);
	    }

	    this.error(equals, "Invalid assignment target.");
	}
	return expr;
    }

    private or(): Expr{
	let expr: Expr = this.and();
	
    	while(this.match(TokenType.OR)){
	    const operator: Token = this.previous();
	    const right: Expr = this.and();
	    expr = new LogicalExpr(expr, operator, right);
	}
	return expr;
    }

    private and(): Expr{
	let expr: Expr = this.equality();

	while(this.match(TokenType.AND)){
	    const operator: Token = this.previous();
	    const right: Expr = this.equality();
	    expr = new LogicalExpr(expr, operator, right);
	}
	
	return expr;
    }

    private equality(): Expr{
	let expr: Expr = this.comparison();
	
	while(this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)){
	    const operator: Token = this.previous();
	    const rigth: Expr = this.comparison();
	    expr = new BinaryExpr(expr, operator, rigth);
	}
	return expr;
    }

    private comparison(): Expr{
	let expr: Expr = this.term();

	while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL,
			 TokenType.LESS, TokenType.LESS_EQUAL)){
	    const operator: Token = this.previous();
	    const right: Expr = this.term();
	    expr = new BinaryExpr(expr, operator, right);
	}
	
	return expr;
    }

    private term(): Expr{
	let expr: Expr = this.factor();

	while(this.match(TokenType.MINUS, TokenType.PLUS)){
	    const operator: Token = this.previous();
	    const right: Expr = this.factor();
	    expr = new BinaryExpr(expr, operator, right);
	}
	
	return expr;

    }


    private factor(): Expr{
	let expr: Expr = this.unary();

	while(this.match(TokenType.SLASH, TokenType.STAR)){
	    const operator: Token = this.previous();
	    const right: Expr = this.unary();
	    expr = new BinaryExpr(expr, operator, right);
	}

	return expr;  
    }

    private unary(): Expr{
	if(this.match(TokenType.BANG, TokenType.MINUS)){
	    const operator: Token = this.previous();
	    const right: Expr = this.unary();
	    return new UnaryExpr(operator, right);
	}
	return this.call();

    }

    private call(): Expr{
	let expr: Expr = this.primary();

	while(true){
	    if(this.match(TokenType.LEFT_PAREN)){
		expr = this.finishCall(expr);
	    } else if(this.match(TokenType.DOT)){
		const name: Token = this.consume(TokenType.IDENTIFIER,
						 "Expected property name after '.'.");
		expr = new GetExpr(expr, name);
	    } else {
		break;
	    }
	}

	return expr;
    }

    private finishCall(callee: Expr): Expr{
	const args: Expr[] = [];
	if(!this.check(TokenType.RIGHT_PAREN)){
	    do{
		if(args.length >= 255){
		    this.error(this.peek(), "Can't have more than 255 arguments.");
		}
		args.push(this.expression());
	    } while(this.match(TokenType.COMMA));
	}
	
	const paren: Token = this.consume(TokenType.RIGHT_PAREN, "Expected ')' after argumets.");

	return new CallExpr(callee, paren, args);
    }

    private primary(): Expr{
	if(this.match(TokenType.FALSE)) return new LiteralExpr(false);
 	if(this.match(TokenType.TRUE)) return new LiteralExpr(true);
	if(this.match(TokenType.NIL)) return new LiteralExpr(null);

	if(this.match(TokenType.NUMBER, TokenType.STRING)){
	    return new LiteralExpr(this.previous().literal);
	}
	
	if(this.match(TokenType.SUPER)){
	    const keyword: Token = this.previous();
	    this.consume(TokenType.DOT, "Expected '.' after 'super'");
	    const method: Token = this.consume(TokenType.IDENTIFIER, "Expected superclass method name.");
	    return new SuperExpr(keyword, method);
	}
	if(this.match(TokenType.THIS)) return new ThisExpr(this.previous());

	if(this.match(TokenType.IDENTIFIER)){
	    return new VariableExpr(this.previous());
	}

	if(this.match(TokenType.LEFT_PAREN)){
	    const expr: Expr = this.expression();
	    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression");
	    return new GroupingExpr(expr);
	}

	throw this.error(this.peek(), "Expected expression");
    }

    private check(t: TokenType): boolean{
	if(this.isAtEnd()) return false;
	return this.peek().t === t;
    }

    private advance(): Token{
	if(!this.isAtEnd()) this.current++;
	return this.previous();
    }

    private isAtEnd(): boolean{
	return this.peek().t === TokenType.EOF;
    }

    private peek(): Token{
	return this.tokens[this.current];
    }

    private previous(): Token{
	return this.tokens[this.current - 1];
    }

    private consume(t: TokenType, message: string): Token{
	if(this.check(t)) return this.advance() ;

	throw this.error(this.peek(), message);
    }
    
    private error(t: Token, message: string): ParseError{
	this.runner.error(t, message);
	return new ParseError();
    }

    private match(...types: TokenType[]): boolean{
	for(let t of types){
	    if(this.check(t)){
		this.advance();
		return true;
	    }
	}
	return false;
    }
}
