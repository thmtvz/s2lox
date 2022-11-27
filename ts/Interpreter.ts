import { Expr } from "Expr";
import { ExprVisitor } from "Expr"
import { AssignExpr } from "Expr";
import { BinaryExpr } from "Expr";
import { CallExpr } from "Expr";
import { GetExpr } from "Expr";
import { GroupingExpr } from "Expr";
import { LiteralExpr } from "Expr";
import { SetExpr } from "Expr";
import { SuperExpr } from "Expr";
import { ThisExpr } from "Expr";
import { LogicalExpr } from "Expr";
import { UnaryExpr } from "Expr";
import { VariableExpr } from "Expr";
import { Stmt } from "Stmt";
import { StmtVisitor } from "Stmt";
import { NoopStmt } from "Stmt";
import { ImportStmt } from "Stmt";
import { BlockStmt } from "Stmt";
import { ClassStmt } from "Stmt";
import { ExpressionStmt } from "Stmt";
import { FunctionStmt } from "Stmt";
import { IfStmt } from "Stmt";
import { PrintStmt } from "Stmt";
import { ReturnStmt } from "Stmt";
import { VarStmt } from "Stmt";
import { WhileStmt } from "Stmt";
import RuntimeError from "RuntimeError";
import S2ltype from "S2ltype";
import Environment from "Environment";
import Runner from "Runner";
import S2loxCallable from "S2loxCallable";
import TokenType from "TokenType";
import Return from "Return";
import Token from "Token";
import S2loxInstance from "S2loxInstance";
import S2loxClass from "S2loxClass";
import S2loxFunction from "S2loxFunction";

export default class Interpreter implements ExprVisitor<S2ltype>, StmtVisitor<void>{
    
    readonly globals = new Environment();
    private environment: Environment = this.globals;
    private readonly locals = new Map<Expr, number>();
    
    constructor(
	private readonly runner: Runner
    ) {
	
    }

    public interpret(statements: Stmt[]): void{
	try{
	    for(let statement of statements){
		this.execute(statement);
	    }
	} catch (e){
	    if(e instanceof RuntimeError) this.runner.runtimeError(e); //🧐🧐
	}
    }

    public visitNoopStmt(stmt: NoopStmt): void{
	return;
    }

    public visitLiteralExpr(expr: LiteralExpr): S2ltype{
	return expr.value;
    }

    public visitGroupingExpr(expr: GroupingExpr): S2ltype{
	return this.evaluate(expr.expression);
    }

    private evaluate(expr: Expr): S2ltype{
	return expr.accept(this);
    }

    public visitUnaryExpr(expr: UnaryExpr): S2ltype{
	let right = this.evaluate(expr.right);

	switch(expr.operator.t){
	    case TokenType.MINUS:
		this.checkNumberOperand(expr.operator, right);
		if(right === null) return null; //🧐🧐
		return -right;
	    case TokenType.BANG:
		return !this.isTruthy(right);
	}
	
	return null;
    }

    private isTruthy(obj: S2ltype): boolean{
	if(obj === null) return false;
	if(obj === false) return obj;
	return true;
    }

    public visitBinaryExpr(expr: BinaryExpr): S2ltype{
	let left = this.evaluate(expr.left);
	let right = this.evaluate(expr.right);

	switch(expr.operator.t){
	    case TokenType.GREATER:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		return left > right;
	    case TokenType.GREATER_EQUAL:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		return left >= right;
	    case TokenType.LESS:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		return left < right;
	    case TokenType.LESS_EQUAL:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		return left <= right;
	    case TokenType.BANG_EQUAL:
		if(left === null || right === null) return null; //🧐🧐
		return !this.isEqual(left, right);
	    case TokenType.EQUAL_EQUAL:
		if(left === null || right === null) return null; //🧐🧐
		return this.isEqual(left, right);
	    case TokenType.MINUS:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		if(typeof left === "number" && typeof right === "number") return left - right;
		return null; //🧐🧐
	    case TokenType.PLUS:
		if(left === null || right === null) return null; //🧐🧐
		if(typeof left === "number" && typeof right === "number"){
		    return left + right;
		}
		if(typeof left === "string" && typeof right === "string") {
		    return left + right;
		}
		throw new RuntimeError(expr.operator, "Operands must be either two numbers or two strings");
	    case TokenType.SLASH:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		if(typeof left === "number" && typeof right === "number") return left / right; //🧐🧐
		return null;
	    case TokenType.STAR:
		if(left === null || right === null) return null; //🧐🧐
		this.checkNumberOperands(expr.operator, left, right);
		if(typeof left === "number" && typeof right === "number") return left * right;
		return null;
	}
	return null;
    }

    private isEqual(o1: S2ltype, o2: S2ltype): S2ltype{
	//check this later
	return o1 == o2;
    }

    private checkNumberOperand(operator: Token, operand: S2ltype): void{
	if(typeof operand === "number") return;
	throw new RuntimeError(operator, "Operantor must be a number");
    }

    private checkNumberOperands(operator: Token, left: S2ltype, right: S2ltype): void{
	if(typeof left === "number" && typeof right === "number") return;
	throw new RuntimeError(operator, "Operands must be numbers");
    }

    private stringify(obj: S2ltype):  string{
	if(obj === null) return "nil";
	return obj.toString();
    }

    public visitExpressionStmt(stmt: ExpressionStmt): void{
	this.evaluate(stmt.expression);
	return;
    }

    public visitPrintStmt(stmt: PrintStmt): void{
	let value = this.evaluate(stmt.expression);
	this.runner.output(this.stringify(value));
	return;
    }

    private execute(stmt: Stmt): void{
	stmt.accept(this);
    }

    public resolve(expr: Expr, depth: number):void{
	this.locals.set(expr, depth);
	return;
    }

    public visitVarStmt(stmt: VarStmt): void{
	let value: S2ltype = null;
	if(stmt.initializer !== null){
	    value = this.evaluate(stmt.initializer);
	}

	this.environment.define(stmt.name.lexeme, value);
	return;
    }

    public visitVariableExpr(expr: VariableExpr): S2ltype{
	return this.lookUpVariable(expr.name, expr);
    }
    
    private lookUpVariable(name: Token, expr: Expr): S2ltype{
	let distance = this.locals.get(expr);
	if(distance !== undefined){
	    return this.environment.getAt(distance, name.lexeme);
	} else {
	    return this.globals.get(name);
	}
    }

    public visitAssignExpr(expr: AssignExpr): S2ltype{
	let value = this.evaluate(expr.value);
	let distance = this.locals.get(expr);
	if(distance !== undefined){
	    this.environment.assignAt(distance, expr.name, value);
	} else {
	    this.globals.assign(expr.name, value);
	}
	
	return value;
    }

    public visitBlockStmt(stmt: BlockStmt): void{
	this.executeBlock(stmt.statements, new Environment(this.environment));
	return;
    }

    public executeBlock(statements: Stmt[], environment: Environment): void{
	let previous = this.environment;
	try{
	    this.environment = environment;
	    for(let statement of statements){
		this.execute(statement);
	    }
	} finally {
	    this.environment = previous;
	}
    }

    public visitIfStmt(stmt: IfStmt): void{
	if(this.isTruthy(this.evaluate(stmt.condition))){
	    this.execute(stmt.thenBranch);
	} else if(stmt.elseBranch != null){
	    this.execute(stmt.elseBranch);
	}
	return;
    }

    public visitLogicalExpr(expr: LogicalExpr): S2ltype{
	let left = this.evaluate(expr.left);

	if(expr.operator.t == TokenType.OR){
	    if(this.isTruthy(left)) return left;
	} else {
	    if(!this.isTruthy(left)) return left;
	}

	return this.evaluate(expr.right);
    }

    public visitSetExpr(expr: SetExpr): S2ltype{
	let obj = this.evaluate(expr.obj);

	if(!(obj instanceof S2loxInstance)){
	    throw new RuntimeError(expr.name, "Only instances have fields");
	}

	let value = this.evaluate(expr.value);
	if(obj instanceof S2loxInstance) //🧐🧐
	    obj.set(expr.name, value);
	return value;
    }

    public visitSuperExpr(expr: SuperExpr): S2ltype{
	let distance = this.locals.get(expr) || 0; //🧐🧐
	let superClass: S2ltype | S2loxClass = this.environment.getAt(distance, "super");
	
	let obj: S2ltype | S2loxInstance = this.environment.getAt(distance - 1, "this");
	let method: S2loxFunction | null = null;

	if(superClass !== null &&
	    superClass instanceof S2loxClass) method = superClass.findMethod(expr.method.lexeme); //🧐🧐

	if(method == null){
	    throw new RuntimeError(expr.method, "Undefined property '" + expr.method.lexeme +
				   "'.");
	}
	
	if(obj instanceof S2loxInstance) return method.bind(obj); //🧐🧐
	return null; //🧐🧐
    }

    public visitThisExpr(expr: ThisExpr): S2ltype{
	return this.lookUpVariable(expr.keyword, expr);
    }

    public visitWhileStmt(stmt: WhileStmt): void{
	while(this.isTruthy(this.evaluate(stmt.condition))){
	    this.execute(stmt.body);
	}
	return;
    }

    public visitCallExpr(expr: CallExpr): S2ltype{
	let callee = this.evaluate(expr.callee);

	let args: S2ltype[] = [];
	for(let argument of expr.args){
	    args.push(this.evaluate(argument));
	}

	if(!((callee instanceof S2loxClass) || (callee instanceof S2loxFunction))){
	    throw new RuntimeError(expr.paren, "Can only call functions and classes.");
	}

	let fn: S2loxCallable = callee;

	if(args.length != fn.arity()){
	    throw new RuntimeError(expr.paren, "Expected "+ fn.arity() + " arguments, " +
				   "but got " + arguments.length + ".");
	}
	return fn.call(this, args);
    }

    public visitFunctionStmt(stmt: FunctionStmt): void{
	let fn = new S2loxFunction(false, this.environment, stmt);
	this.environment.define(stmt.name.lexeme, fn);
	return;
    }

    public visitReturnStmt(stmt: ReturnStmt): void{
	let value: S2ltype = null;
	if(stmt.value != null) value = this.evaluate(stmt.value);

	throw new Return(value);
    }

    public visitClassStmt(stmt: ClassStmt): void{
	let superClass: S2ltype = null;
	if(stmt.superClass !== null){
	    superClass = this.evaluate(stmt.superClass);
	    if(!(superClass instanceof S2loxClass)){
		throw new RuntimeError(stmt.superClass.name,
				       "Superclass must be a class.");
	    }
	}

	this.environment.define(stmt.name.lexeme, null);
	
	if(stmt.superClass != null){
	    this.environment = new Environment(this.environment);
	    this.environment.define("super", superClass);
	}

	let methods = new Map<string, S2loxFunction>();
	for(let method of stmt.methods){
	    let fn = new S2loxFunction(method.name.lexeme === "init",
				       this.environment, method);
	    methods.set(method.name.lexeme, fn);
	}

	let klass = new S2loxClass(stmt.name.lexeme, superClass, methods);
	if(stmt.superClass !== null){
	    if(this.environment.enclosing !== null) //🧐🧐
		this.environment = this.environment.enclosing;
	}
	this.environment.assign(stmt.name, klass);
	return;
    }
    
    public visitGetExpr(expr: GetExpr): S2ltype{
	let obj = this.evaluate(expr.obj);
	if(obj instanceof S2loxInstance){
	    return obj.get(expr.name);
	}

	throw new RuntimeError(expr.name, "Only instances have properties.");
    }

    public visitImportStmt(stmt: ImportStmt): void{
	let filename = stmt.name.literal + ".lx";
	
	let code = this.runner.readfile(filename);

	this.runner.run(code);
	
	return; 
    }

}
