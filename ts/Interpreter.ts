import { Expr } from "Expr";
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

export default class Interpreter implements ExprVisitor<S2ltype>, StmtVisitor<void>{
    
    readonly globals = new Environment();
    private environment: Environment = globals;
    private readonly locals: {[k: Expr]: number} = {};
    
    constructor(
	private readonly runner: Runner
    ) {
	
    }

    public interpret(statements: Stmt[]){
	try{
	    for(let statement of statements){
		this.execute(statement);
	    }
	} catch (e: RuntimeError){
	    this.runner.runtimeError(e);
	}
    }

    public 
}
