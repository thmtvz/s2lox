import { Expr } from "./Expr.js";
import { ExprVisitor } from "./Expr.js";
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
import Token from "./Token.js";
import Stack from "./Stack.js";
import Runner from "./Runner.js";
import Interpreter from "./Interpreter.js";

enum FunctionType{
    NONE,
    FUNCTION,
    INITIALIZER,
    METHOD
}

enum ClassType{
    NONE,
    CLASS,
    SUBCLASS
}

export default class Resolver implements ExprVisitor<void>, StmtVisitor<void>{
    
    private readonly scopes = new Stack<Map<string, boolean>>();
    private currentFunction: FunctionType = FunctionType.NONE;
    private currentClass: ClassType = ClassType.NONE;

    constructor(
	private readonly runner: Runner,
	private readonly interpreter: Interpreter,
    ) {}
    
    public resolve(stmtOrExpr: Stmt[] | Stmt | Expr): void{
	if(stmtOrExpr instanceof Array){
	    for(let statement of stmtOrExpr){
		this.resolve(statement);
	    }
	    return;
	}
	stmtOrExpr.accept(this);
    }
    
    public visitNoopStmt(stmt: NoopStmt): void{
	return;
    }

    public visitImportStmt(stmt: ImportStmt): void{
	return;
    }

    public visitBlockStmt(stmt: BlockStmt): void{
	this.beginScope();
	this.resolve(stmt.statements);
	this.endScope();
	return;
    }
    
    public visitClassStmt(stmt: ClassStmt): void{
	let enclosingClass: ClassType = this.currentClass;
	this.currentClass = ClassType.CLASS;

	this.declare(stmt.name);
	this.define(stmt.name);

	if(stmt.superClass != null){
	    if(stmt.name.lexeme === stmt.superClass.name.lexeme){
		this.runner.error(stmt.superClass.name,
			     "Class can't inherit from itself.");
	    }

	    this.resolve(stmt.superClass);

	    this.beginScope();
	    let s = this.scopes.peek();
	    if(s !== null) s.set("super", true); //🧐🧐
	}
	
	this.beginScope();
	let s = this.scopes.peek();
	if(s !== null) s.set("this", true); //🧐🧐

	for(let method of stmt.methods){
	    let declaration: FunctionType = FunctionType.METHOD;
	    if(method.name.lexeme === "init"){
		declaration = FunctionType.INITIALIZER;
	    }
	    this.resolveFunction(method, declaration);
	}
	this.endScope();

	if(stmt.superClass != null) this.endScope();
	this.currentClass = enclosingClass;
	return;
    }
    
    public visitLiteralExpr(expr: LiteralExpr): void{
	return;
    }

    public visitExpressionStmt(stmt: ExpressionStmt): void{
	this.resolve(stmt.expression);
	return;
    }
    
    public visitFunctionStmt(stmt: FunctionStmt): void{
	this.declare(stmt.name);
	this.define(stmt.name);

	this.resolveFunction(stmt, FunctionType.FUNCTION);
	return;
    }

    public visitIfStmt(stmt: IfStmt): void{
	this.resolve(stmt.condition);
	this.resolve(stmt.thenBranch);
	if(stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
	return;
    }

    public visitPrintStmt(stmt: PrintStmt): void{
	this.resolve(stmt.expression);
	return;
    }

    public visitReturnStmt(stmt: ReturnStmt): void{
	if(this.currentFunction == FunctionType.NONE){
	    this.runner.error(stmt.keyword,
			      "Can't return from top-level code");
	}

	if(stmt.value !== null){
	    if(this.currentFunction === FunctionType.INITIALIZER){
		this.runner.error(stmt.keyword,
				  "Can't return a value from an initializer");
	    }
	    this.resolve(stmt.value);
	}
	return;
    }

    public visitVarStmt(stmt: VarStmt): void{
	this.declare(stmt.name);
	if(stmt.initializer !== null){
	    this.resolve(stmt.initializer);
	}
	this.define(stmt.name);
	return;
    }

    public visitWhileStmt(stmt: WhileStmt): void{
	this.resolve(stmt.condition);
	this.resolve(stmt.body);
	return;
    }
    
    public visitAssignExpr(expr: AssignExpr): void{
	this.resolve(expr.value);
	this.resolveLocal(expr, expr.name);
	return;
    }

    public visitBinaryExpr(expr: BinaryExpr): void{
	this.resolve(expr.left);
	this.resolve(expr.right);
	return;
    }

    public visitCallExpr(expr: CallExpr): void{
	this.resolve(expr.callee);

	for(let argument of expr.args){
	    this.resolve(argument);
	}

	return;
    }
    
    public visitGetExpr(expr: GetExpr): void{
	this.resolve(expr.obj);
	return;
    }
    
    public visitGroupingExpr(expr: GroupingExpr){
	this.resolve(expr.expression);
	return;
    }

    public visitLogicalExpr(expr: LogicalExpr): void{
	this.resolve(expr.left);
	this.resolve(expr.right);
	return;
    }

    public visitSetExpr(expr: SetExpr): void{
	this.resolve(expr.value);
	this.resolve(expr.obj);
	return;
    }
    
    public visitSuperExpr(expr: SuperExpr): void{
	if(this.currentClass == ClassType.NONE){
	    this.runner.error(expr.keyword,
			"Can't use 'super' outside of a class.");
	} else if(this.currentClass != ClassType.SUBCLASS){
	    this.runner.error(expr.keyword,
			"Can't use 'super' in a class with no superClass");
	}
	this.resolveLocal(expr, expr.keyword);
	return;
    }

    public visitThisExpr(expr: ThisExpr): void{
	if(this.currentClass == ClassType.NONE){
	    this.runner.error(expr.keyword,
			      "Can't use 'this' outside class.");
	    return;
	}
	this.resolveLocal(expr, expr.keyword);
	return;
    }

    public visitUnaryExpr(expr: UnaryExpr): void{
	this.resolve(expr.right);
	return;
    }
    
    public visitVariableExpr(expr: VariableExpr): void{
	let s = this.scopes.peek();
	if(s !== null && s.get(expr.name.lexeme) == false){ //🧐🧐
	    this.runner.error(expr.name,
			      "Can't read local variable in its own initializer.");
	}

	this.resolveLocal(expr, expr.name);
	return;
    }

    private resolveFunction(fn: FunctionStmt, t: FunctionType): void{
	const enclosingFunction = this.currentFunction;
	this.currentFunction = t;

	this.beginScope();
	for(let param of fn.params){
	    this.declare(param);
	    this.define(param);
	}

	this.resolve(fn.body);
	this.endScope();
	this.currentFunction = enclosingFunction;

	return;
    }

    private beginScope(): void{
	this.scopes.push(new Map());
	return;
    }

    private endScope(): void{
	this.scopes.pop();
	return;
    }

    private declare(name: Token): void{
	//if(this.scopes.empty()) return; //🤨🤨
	const scope = this.scopes.peek();
	if(scope === null) return; //🤨🤨
	if(scope.has(name.lexeme)){
	    this.runner.error(name, "Already variable name with this name in this scope");
	}
	scope.set(name.lexeme, false);
    }

    private define(name: Token): void{
	const scope = this.scopes.peek();
	if(scope === null) return;
	scope.set(name.lexeme, true);
	return;
    }

    private resolveLocal(expr: Expr, name: Token): void{
	for(let i = this.scopes.size() - 1; i >= 0; --i){
	    if(this.scopes.get(i).has(name.lexeme)){
		this.interpreter.resolve(expr, this.scopes.size() - i - 1);
		return;
	    }
	}
    }
}
