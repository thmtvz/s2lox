import { Expr } from "./Expr.js";
import { ExprVisitor } from "./Expr.js"
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
import { StmtVisitor } from "./Stmt.js";
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
import RuntimeError from "./RuntimeError.js";
import S2ltype from "./S2ltype.js";
import Environment from "./Environment.js";
import Runner from "./Runner.js";
import S2loxCallable from "./S2loxCallable.js";
import TokenType from "./TokenType.js";
import Return from "./Return.js";
import Token from "./Token.js";
import S2loxInstance from "./S2loxInstance.js";
import S2loxClass from "./S2loxClass.js";
import S2loxFunction from "./S2loxFunction.js";

export default class Interpreter implements ExprVisitor<S2ltype>, StmtVisitor<void>{
    
    readonly globals = new Environment();
    private environment: Environment = this.globals;
    private readonly locals = new Map<Expr, number>();
    
    constructor(
	private readonly runner: Runner
    ) {
	this.globals.define("toString", new class implements S2loxCallable{
	    public arity() { return 1 }

	    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
		return `${args[0]}`;
	    }
	    
	    public toString() { return "<native fun>"; }
	});

	this.globals.define("clock", new class implements S2loxCallable{
	    constructor(
		private readonly clock: () => number,
	    ){}

	    public arity() { return 0; }
	    
	    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
		this.clock();
		return null;
	    }

	    public toString() { return "<native fun>"; }
 
	}(this.runner.clock));
	
	this.globals.define("number", new class implements S2loxCallable{
	    public arity() { return 1; }

	    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
		let arg = args[0];
		if(arg === true || arg === false){
		    if(arg) return 1;
		    return 0;
		}
		if(arg === null) return 0;
		return parseFloat(arg.toString());
	    }

	    public toString() { return "<native fun>"; }
	});

	this.globals.define("input", new class implements S2loxCallable{
	    constructor(
		private readonly input: (p: string) => Promise<string>,
	    ){}

	    public arity() { return 0; }

	    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
		//return this.input();
		//TODO implement this
		return null;
	    }
	    
	    public toString() { return "<native fun>"; }
	}(this.runner.readline));

	this.globals.define("random", new class implements S2loxCallable{
	    public arity() { return 2; }

	    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
		let maxValue = args[1] ? parseFloat(args[1].toString()) : 0;
		let minValue = args[0] ? parseFloat(args[0].toString()) : 0;
		return Math.ceil(Math.random() * (maxValue - minValue)) + minValue;
	    }
	    
	    public toString() { return "<native fun>"; }
	}());

	this.globals.define("object", new S2loxClass("object", null, new Map<string, S2loxFunction>()));
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
