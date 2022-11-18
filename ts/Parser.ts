import TokenType from "TokenType";
import RuntimeException from "RuntimeException";
import Runner from "Runner";
import RuntimeError from "RuntimeError";

export default class Parser{
    
    private static class ParseError extends RuntimeException {}

    private current = 0;

    constructor(
	private readonly runner: Runner,
	private readonly tokens: Token[],
    ) {}
    
    public parse(): Stmt[]{
	const statements = [];
	while(!this.isAtEnd())
	    statements.push(declaration());
	return statements;
    }

    private declaration(): Stmt{
	try{
	    if(this.match(CLASS)) return this.classDeclaration();
	    if(this.match(FUN)) return this.fn("function");
	    if(this.match(VAR)) return this.varDeclaration();
	    
	    return this.statement();
	} catch(e){
	    if(e instanceof ParseError)
		this.synchronize();
	    return null;
	}
    } 

    private classDeclaration(): Stmt{
	const name = this.consume(TokenType.IDENTIFIER, "Expected class name.");
	
	const superClass: Expr.Variable | null = null;
	if(this.match(TokenType.LESS)){
	    consume(TokenType.IDENTIFIER, "Expected superclass name.");
	    superClass = new Expr.Variable(this.previous());
	}
	this.consume(TokenType.LEFT_BRACE, "Expected '{' before class body.");

	const methods: Stmt.Fn= [];
	while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd())
	    methods.push(this.fn("method"));

	consume(TokenType.RIGHT_BRACE, "Expected closing '}' after class body.");

	return new Stmt.Class(name, superClass, methods);
    }

    private fn(kind: string): Stmt.Fn{
	const Name: Token = this.consume(TokenType.IDENTIFIER, "Expected " + kind + " name.");
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after " + kind + " name.");
	const parameters: Token[] = [];
	if(!this.check(TokenType.RIGHT_PAREN)){
	    do{
		if(parameters.size() >= 255){
		    this.error(peek(), "Can't have more than 255 parameters.");
		}
		parameters.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name."));
	    } while(this.match(TokenType.COMMA));
	}
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameters");
	this.consume(TokenType.LEFT_BRACE, "Expected '{' before " + kind + " body.");

	const body: Stmt[] = this.block();
	return new Stmt.Fn(name, parameters, body);
   }
    
    private varDeclaration(): Stmt.Var{
	const name: Token = this.consume(TokenType.IDENTIFIER, "Expected variable name.");

	const initializer: Expr | null = null;
	if(this.match(TokenType.EQUAL)){
	    initializer = this.expression();
	}

	this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration");
	return new Stmt.Var(name, initializer);
    }

    private statement(): Stmt{
	if(this.match(TokenType.IMPORT)) return this.importStatement();
	if(this.match(TokenType.FOR)) return this.forStatement();
	if(this.match(TokenType.IF)) return this.ifStatement();
	if(this.match(TokenType.PRINT)) return this.printStatement();
	if(this.match(TokenType.RETURN)) return this.returnStatement();
	if(this.match(TokenType.WHILE)) return this.whileStatement();
	if(this.match(TokenType.LEFT_BRACE)) return new Stmt.Block(block());
	return expressionStatement();

    }

    private importStatement(){
	const name = this.consume(TokenType.STRING, "Expected module name.");
	this.consume(TokenType.SEMICOLON, "Expected ';' after import statement");

	return Stmt.Import(name);
    }

    private forStatement(): Stmt{
	this.consume(LEFT_PAREN, "Expected '(' after 'for'.");
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
	    body = new Stmt.Block([body, new Stmt.Expression(increment)]);
	}
	if(condition == null) condition = new Expr.Literal(true);
	body = new Stmt.While(condition, body);

	if(initializer != null){
	    body = new Stmt.Block([initializer, body]);
	}

	return body;
    }

    private ifStatement(): Stmt{
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'if'.");
	const condition: Expr = this.expression();
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after if condition.");

	const thenBranch: Stmt = this.statement();
	const elseBranch: Stmt | null = null;
	if(this.match(TokenType.ELSE)){
	    elseBranch = this.statement();
	}
	
	return new Stmt.If(condition, thenBranch, elseBranch);
    }

    private printStatement(): Stmt{
	const value: Expr = this.expression();
	this.consume(TokenType.SEMICOLON, "Expected ';' after value");
	return new Stmt.Print(value);
    }

    private returnStatement(): Stmt{
	const keyword = this.previous();
	let value: Expr | null;
	if(!this.check(TokenType.SEMICOLON)){
	    value = this.expression();
	}
	
	this.consume(TokenType.SEMICOLON, "Expected ';' after return value.");
	return new Stmt.Return(keyword, value);
    }

    private whileStatement(): Stmt{
	this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'while'.");
	const condition: Expr = this.expression();
	this.consume(TokenType.RIGHT_PAREN, "Expected ')' after condition.");
	const body: Stmt = this.statement();

	return new Stmt.While(condition, body);
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
	this.consume(TokeType.SEMICOLON, "Expected ';' after expression");
	return new Stmt.Expression(expr);
    }

    private synchronize(): void{
	this.advance();

	while(!this.isAtEnd()){
	    if(this.previous().type == TokenType.SEMICOLON) return;

	    switch(this.peek().type){
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

	    if(expr instanceof Expr.Variable){
		const name: Token = expr.name;
		return new Expr.Assign(name, value);
	    } else if(expr instanceof Expr.Get){
		const g: Expr.Get = expr;
		//remember to change expr.set
		return new Expr.Set(g.obj, g.name, value);
	    }

	    this.error(equals, "Invalid assignment target.");
	}
	return expr;
    }

    private or(): Expr{
	const expr: Expr = this.and();
	
    	while(this.match(TokenType.OR)){
	    const operator: Token = this.previous();
	    const right: Expr = this.and();
	    expr = new Expr.Logical(expr, operator, right);
	}
	return expr;
    }

    private and(): Expr{
	const expr: Expr = this.equality();

	while(this.match(TokenType.AND)){
	    Token operator = previous();
	    Expr right = equality();
	    expr = new Expr.Logical(expr, operator, right);
	}
	
	return expr;
    }

    private equality(): Expr{
	const expr: Expr = this.comparison();
	
	while(this.match(TokenTyoe.BANG_EQUAL, TokenType.EQUAL_EQUAL)){
	    const operator: Token = this.previous();
	    const rigth: Expr = this.comparison();
	    expr = new Expr.Binary(expr, operator, rigth);
	}
	return expr;
    }

    private comparison(): Expr{
	const expr: Expr = this.term();

	while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL,
			 TokenType.LESS, TokenType.LESS_EQUAL)){
	    const operator: Token = this.previous();
	    const right: Expr = this.term();
	    expr = new Expr.Binary(expr, operator, right);
	}
	
	return expr;
    }

    private term(): Expr{
	const expr: Expr = this.factor();

	while(this.match(TokenType.MINUS, TokenType.PLUS)){
	    const operator: Token = this.previous();
	    const right: Expr = this.factor();
	    expr = new Expr.Binary(expr, operator, right);
	}
	
	return expr;

    }


    private factor(): Expr{
	const expr: Expr = this.unary();

	while(match(TokenType.SLASH, TokenType.STAR)){
	    const operator: Token = this.previous();
	    const right: Expr = this.unary();
	    expr = new Expr.Binary(expr, operator, right);
	}

	return expr;  
    }

    private unary(): Expr{
	if(this.match(TokenType.BANG, TokenType.MINUS)){
	    const operator: Token = this.previous();
	    const right: Expr = this.unary();
	    return new Expr.Unary(operator, right);
	}
	return this.call();

    }

    private call(): Expr{
	const expr: Expr = this.primary();

	while(true){
	    if(this.match(TokenType.LEFT_PAREN)){
		expr = this.finishCall(expr);
	    } else if(this.match(TokenType.DOT)){
		const name: Token = this.consume(TokenType.IDENTIFIER,
						 "Expected property name after '.'.");
		expr = new Expr.Get(expr, name);
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
		if(args.size() >= 255){
		    this.error(this.peek(), "Can't have more than 255 arguments.");
		}
		args.push(this.expression());
	    } while(this.match(TokenType.COMMA));
	}
	
	const paren: Token = consume(RIGHT_PAREN, "Expected ')' after argumets.");

	return new Expr.Call(callee, paren, args);
    }

    private primary(): Expr{
	if(this.match(TokenType.FALSE)) return new Expr.Literal(false);
 	if(this.match(TokenType.TRUE)) return new Expr.Literal(true);
	if(this.match(TokenType.NIL)) return new Expr.Literal(null);

	if(this.match(TokenType.NUMBER, TokenType.STRING)){
	    return new Expr.Literal(previous().literal);
	}
	
	if(this.match(TokenType.SUPER)){
	    const keyword: Expr = this.previous();
	    this.consume(TokenType.DOT, "Expected '.' after 'super'");
	    const method: Token = this.consume(IDENTIFIER, "Expected superclass method name.");
	    return new Expr.Super(keyword, method);
	}
	if(this.match(TokenType.THIS)) return new Expr.This(previous());

	if(this.match(TokenType.IDENTIFIER)){
	    return new Expr.Variable(previous());
	}

	if(this.match(TokenType.LEFT_PAREN)){
	    const expr: Expr = this.expression();
	    consume(TokenType.RIGHT_PAREN, "Expect ')' after expression");
	    return new Expr.Grouping(expr);
	}

	throw error(peek(), "Expected expression");
    }

    private check(TokenType t): bool{
	if(this.isAtEnd()) return false;
	return this.peek().type === t;
    }

    private advance(): Token{
	if(!this.isAtEnd()) this.current++;
	return this.previous();
    }

    private isAtEnd(): bool{
	return this.peek().type === TokenType.EOF;
    }

    private peek(): Token{
	return this.tokens[current];
    }

    private previous(): Token{
	return this.tokens[current - 1];
    }

    private consume(t: TokenType, message: string): Token{
	if(this.check(t)) return this.advance() ;

	throw this.error(this.peek, message);
    }
    
    private error(t: Token, message: string): Parser.ParseError{
	this.runner.error(t, message);
	return new Parser.ParseError();
    }

    private match(...types: TokenType[]): bool{
	for(let t: TokenType in types){
	    if(this.check(t)){
		advance();
		return true;
	    }
	}
	return false;
    }
}
