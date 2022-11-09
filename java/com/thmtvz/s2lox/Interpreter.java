package com.thmtvz.s2lox;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static com.thmtvz.s2lox.TokenType.*;

class Interpreter implements Expr.Visitor<Object>, Stmt.Visitor<Void>{

    final Environment globals = new Environment();
    private Environment environment = globals;
    private final Map<Expr, Integer> locals = new HashMap<>();

    Interpreter(){
	globals.define("clock", new S2loxCallable(){
		@Override
		public int arity() { return 0; }

		@Override
		public Object call(Interpreter interpreter, List<Object> arguments){
		    return (double)System.currentTimeMillis() / 1000.0;
		}

		@Override
		public String toString() { return "<native fun>"; }
	    });
	globals.define("toString", new S2loxCallable(){
		@Override
		public int arity(){ return 1; }

		@Override
		public Object call(Interpreter interpreter, List<Object> arguments){
		    return stringify(arguments.get(0));
		}

		public String toString() { return "<native fun>"; }
	    });
    }

    void interpret(List<Stmt> statements){
	try{
	    for(Stmt statement : statements){
		execute(statement);
	    }
	} catch (RuntimeError e){
	    S2lox.runtimeError(e);
	}
    }

    @Override
    public Object visitLiteralExpr(Expr.Literal expr){
	return expr.value;
    }
    
    @Override
    public Object visitGroupingExpr(Expr.Grouping expr){
	return evaluate(expr.expression);
    }

    private Object evaluate(Expr expr){
	return expr.accept(this);
    }

    @Override
    public Object visitUnaryExpr(Expr.Unary expr){
	Object right = evaluate(expr.right);

	switch(expr.operator.type){
	case MINUS:
	    checkNumberOperand(expr.operator, right);
	    return -(double)right;
	case BANG:
	    return !isTruthy(right);
	}
	
	return null;
    }

    private boolean isTruthy(Object object){
	if(object == null) return false;
	if(object instanceof Boolean) return (boolean)object;
	return true;
    }

    @Override
    public Object visitBinaryExpr(Expr.Binary expr){
	Object left = evaluate(expr.left);
	Object right = evaluate(expr.right);

	switch(expr.operator.type){
	case GREATER:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left > (double)right;
	case GREATER_EQUAL:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left >= (double)right;
	case LESS:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left < (double)right;
	case LESS_EQUAL:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left <= (double)right;
	case BANG_EQUAL: return !isEqual(left, right);
	case EQUAL_EQUAL: return isEqual(left, right);
	case MINUS:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left - (double)right;
	case PLUS:
	    if(left instanceof Double && right instanceof Double){
		return (double)left + (double)right;
	    }
	    if(left instanceof String && right instanceof String) {
		return (String)left + (String)right;
	    }
	    throw new RuntimeError(expr.operator, "Operands must be either two numbers or two strings");
	case SLASH:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left / (double)right;
	case STAR:
	    checkNumberOperands(expr.operator, left, right);
	    return (double)left * (double)right;
	}
	
	return null;
    }

    private boolean isEqual(Object o1, Object o2){
	if(o1 == null && o2 == null) return true;
	if(o1 == null) return false;

	return o1.equals(o2);
    }

    private void checkNumberOperand(Token operator, Object operand){
	if(operand instanceof Double) return;
	throw new RuntimeError(operator, "Operantor must be a number");
    }

    private void checkNumberOperands(Token operator, Object left, Object right){
	if(left instanceof Double && right instanceof Double) return;
	throw new RuntimeError(operator, "Operands must be numbers");
    }

    private String stringify(Object object){
	if(object == null)return "nil";

	if(object instanceof Double){
	    String text = object.toString();
	    if(text.endsWith(".0")){
		return text.substring(0, text.length() - 2);
	    }
	    return text;
	}
	return object.toString();
    }

    @Override
    public Void visitExpressionStmt(Stmt.Expression stmt){
	evaluate(stmt.expression);
	return null;
    }

    @Override
    public Void visitPrintStmt(Stmt.Print stmt){
	Object value = evaluate(stmt.expression);
	System.out.println(stringify(value));
	return null;
    }

    private void execute(Stmt statement){
	statement.accept(this);
    }

    void resolve(Expr expr, int depth){
	locals.put(expr, depth);
    }

    @Override
    public Void visitVarStmt(Stmt.Var stmt){
	Object value = null;
	if(stmt.initializer != null){
	    value = evaluate(stmt.initializer);
	}

	environment.define(stmt.name.lexeme, value);
	return null;
    }

    @Override
    public Object visitVariableExpr(Expr.Variable expr){
	return lookUpVariable(expr.name, expr);
    }
    
    private Object lookUpVariable(Token name, Expr expr){
	Integer distance = locals.get(expr);
	if(distance != null){
	    return environment.getAt(distance, name.lexeme);
	} else {
	    return globals.get(name);
	}
    }

    @Override
    public Object visitAssignExpr(Expr.Assign expr){
	Object value = evaluate(expr.value);
	Integer distance = locals.get(expr);
	if(distance != null){
	    environment.assignAt(distance, expr.name, value);
	} else {
	    globals.assign(expr.name, value);
	}
	
	return value;
    }

    @Override
    public Void visitBlockStmt(Stmt.Block stmt){
	//nao esquecer de dar uma olhadinha no teste sem o this aqui
	executeBlock(stmt.statements, new Environment(this.environment));
	return null;
    }
    
    void executeBlock(List<Stmt> statements, Environment environment){
	Environment previous = this.environment;
	try{
	    this.environment = environment;
	    for(Stmt statement : statements){
		execute(statement);
	    }
	} finally {
	    this.environment = previous;
	}
    }

    @Override
    public Void visitIfStmt(Stmt.If stmt){
	if(isTruthy(evaluate(stmt.condition))){
	    execute(stmt.thenBranch);
	} else if(stmt.elseBranch != null){
	    execute(stmt.elseBranch);
	}
	return null;
    }

    @Override
    public Object visitLogicalExpr(Expr.Logical expr){
	Object left = evaluate(expr.left);

	if(expr.operator.type == OR){
	    if(isTruthy(left)) return left;
	} else {
	    if(!isTruthy(left)) return  left;
	}

	return evaluate(expr.right);
    }
    
    @Override
    public Object visitSetExpr(Expr.Set expr){
	Object object = evaluate(expr.object);

	if(!(object instanceof S2loxInstance)){
	    throw new RuntimeError(expr.name, "Only instances have fields");
	}

	Object value = evaluate(expr.value);
	((S2loxInstance)object).set(expr.name, value);
	return value;
    }

    @Override
    public Object visitSuperExpr(Expr.Super expr){
	int distance = locals.get(expr);
	S2loxClass superClass = (S2loxClass)environment.getAt(distance, "super");
	S2loxInstance object = (S2loxInstance)environment.getAt(distance - 1, "this");
	S2loxFunction method = superClass.findMethod(expr.method.lexeme);
	if(method == null){
	    throw new RuntimeError(expr.method, "Undefined property '" + expr.method.lexeme +
				   "'.");
	}
	return method.bind(object);
    }

    @Override
    public Object visitThisExpr(Expr.This expr){
	return lookUpVariable(expr.keyword, expr);
    }

    @Override
    public Void visitWhileStmt(Stmt.While stmt){
	while(isTruthy(evaluate(stmt.condition))){
	    execute(stmt.body);
	}
	return null;
    }

    @Override
    public Object visitCallExpr(Expr.Call expr){
	Object callee = evaluate(expr.callee);

	List<Object> arguments = new ArrayList<>();
	for(Expr argument : expr.arguments){
	    arguments.add(evaluate(argument));
	}

	if(!(callee instanceof S2loxCallable)){
	    throw new RuntimeError(expr.paren, "Can only call functions and classes.");
	}

	S2loxCallable function = (S2loxCallable)callee;

	if(arguments.size() != function.arity()){
	    throw new RuntimeError(expr.paren, "Expected "+ function.arity() + " arguments, " +
				   "but got " + arguments.size() + ".");
	}
	return function.call(this, arguments);
    }
    
    @Override
    public Void visitFunctionStmt(Stmt.Function stmt){
	S2loxFunction function = new S2loxFunction(stmt, environment, false);
	environment.define(stmt.name.lexeme, function);
	return null;
    }

    @Override
    public Void visitReturnStmt(Stmt.Return stmt){
	Object value = null;
	if(stmt.value != null) value = evaluate(stmt.value);

	throw new Return(value);
    }
    
    @Override
    public Void visitClassStmt(Stmt.Class stmt){
	Object superClass = null;
	if(stmt.superClass != null){
	    superClass = evaluate(stmt.superClass);
	    if(!(superClass instanceof S2loxClass)){
		throw new RuntimeError(stmt.superClass.name,
				       "Superclass must be a class.");
	    }
	}

	environment.define(stmt.name.lexeme, null);
	
	if(stmt.superClass != null){
	    environment = new Environment(environment);
	    environment.define("super", superClass);
	}

	Map<String, S2loxFunction> methods = new HashMap<>();
	for(Stmt.Function method : stmt.methods){
	    S2loxFunction function = new S2loxFunction(method, environment,
						       method.name.lexeme.equals("init"));
	    methods.put(method.name.lexeme, function);
	}

	S2loxClass klass = new S2loxClass(stmt.name.lexeme, (S2loxClass)superClass, methods);
	if(stmt.superClass != null){
	    environment = environment.enclosing;
	}
	environment.assign(stmt.name, klass);
	return null;
    }

    @Override
    public Object visitGetExpr(Expr.Get expr){
	Object object = evaluate(expr.object);
	if(object instanceof S2loxInstance){
	    return ((S2loxInstance)object).get(expr.name);
	}

	throw new RuntimeError(expr.name, "Only instances have properties.");
    }

}
