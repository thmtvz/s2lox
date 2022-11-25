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

	switch(expr.operator.type){
	    case TokenType.MINUS:
		this.checkNumberOperand(expr.operator, right);
		return -(double)right;
	    case TokenType.BANG:
		return !isTruthy(right);
	}
	
	return null;
    }

    private isTruthy(obj: S2ltype): boolean{
	if(obj === null) return false;
	if(obj === false) return b;
	return true;
    }

    public visitBinaryExpr(expr: BinaryExpr): S2ltype{
	let left = this.evaluate(expr.left);
	let right = this.evaluate(expr.right);

	switch(expr.operator.type){
	    case Tokentype.GREATER:
		this.checkNumberOperands(expr.operator, left, right);
		return left > right;
	    case Tokentype.GREATER_EQUAL:
		this.checkNumberOperands(expr.operator, left, right);
		return left >= right;
	    case Tokentype.LESS:
		this.checkNumberOperands(expr.operator, left, right);
		return left < right;
	    case Tokentype.LESS_EQUAL:
		this.checkNumberOperands(expr.operator, left, right);
		return left <= right;
	    case Tokentype.BANG_EQUAL:
		return !this.isEqual(left, right);
	    case Tokentype.EQUAL_EQUAL:
		return this.isEqual(left, right);
	    case Tokentype.MINUS:
		this.checkNumberOperands(expr.operator, left, right);
		return left - right;
	    case Tokentype.PLUS:
		if(typeof left === "number" && typeof right === "number"){
		    return left + right;
		}
		if(typeof left === "string" && typeof right === "string") {
		    return left + right;
		}
		throw new RuntimeError(expr.operator, "Operands must be either two numbers or two strings");
	    case Tokentype.SLASH:
		this.checkNumberOperands(expr.operator, left, right);
		return left / right;
	    case Tokentype.STAR:
		this.checkNumberOperands(expr.operator, left, right);
		return left * right;
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
	if(object === null) return "nil";
	return obj.toString();
    }

    public visitExpressionStmt(stmt: ExpressionStmt): void{
	this.evaluate(stmt.expression);
	return null;
    }

    public visitPrintStmt(stmt: PrintStmt): void{
	let value = this.evaluate(stmt.expression);
	this.runner.output(this.stringify(value));
	return null;
    }

    private execute(stmt: Stmt): void{
	stmt.accept(this);
    }

    public resolve(expr: Expr, depth: number){
	this.locals.put(expr, depth);
    }

    public visitVarStmt(stmt: VarStmt): void{
	let value: S2ltype = null;
	if(stmt.initializer !== null){
	    value = this.evaluate(stmt.initializer);
	}

	this.environment.define(stmt.name.lexeme, value);
	return null;
    }

    public visitVariableExpr(Expr.Variable expr): S2ltype{
	return this.lookUpVariable(expr.name, expr);
    }
    
    private lookUpVariable(name: Token, expr: Expr): S2ltype{
	let distance = this.locals.get(expr);
	if(distance !== null){
	    return this.environment.getAt(distance, name.lexeme);
	} else {
	    return this.globals.get(name);
	}
    }

    public visitAssignExpr(expr: AssignExpr): S2ltype{
	let value = this.evaluate(expr.value);
	let distance = this.locals.get(expr);
	if(distance !== null){
	    this.environment.assignAt(distance, expr.name, value);
	} else {
	    this.globals.assign(expr.name, value);
	}
	
	return value;
    }

    public visitBlockStmt(Stmt.Block stmt): void{
	this.executeBlock(stmt.statements, new Environment(this.environment));
	return null;
    }

    public executeBlock(statements: Stmt[], environment: Environment): void{
	let previous = this.environment;
	try{
	    this.environment = environment;
	    for(Stmt statement : statements){
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
	return null;
    }

    public visitLogicalExpr(Expr.Logical expr): S2ltype{
	let left = this.evaluate(expr.left);

	if(expr.operator.type == TokenType.OR){
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

	let value = evaluate(expr.value);
	if(obj instanceof "S2loxInstance") //🧐🧐
	    obj.set(expr.name, value);
	return value;
    }

    public visitSuperExpr(Expr.Super expr): S2ltype{
	let distance = this.locals.get(expr);
	let superClass: S2loxClass = this.environment.getAt(distance, "super");
	//continue at here

	S2loxInstance object = (S2loxInstance)environment.getAt(distance - 1, "this");
	S2loxFunction method = superClass.findMethod(expr.method.lexeme);
	if(method == null){
	    throw new RuntimeError(expr.method, "Undefined property '" + expr.method.lexeme +
				   "'.");
	}
	return method.bind(object);
    }


}
