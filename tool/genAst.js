#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

var veryDebug = false;

var exitFns = [];

process.on("exit", (c) => {
    if (!c){
	exitFns.forEach((fn) => {
	    fn();
	})
    }
    return;
});

function appendToExitFns(fn){
    exitFns.push(fn);
    return;
}

function help(){
    error("Usage: ./genExprClass.js OUTDIR [veryDebug]");
}

function error(message, e, code = 1){
    veryDebug ? console.log(e) : console.log(message);
    process.exit(code);
}

function bufferedWriteToFile(filepath){
    let file;
    let hasFlushd = false;
    try{
	file = path.resolve(filepath);
    } catch (e){
	error("Bad filename", e);
    }
    let buf = "";
    function flush(){
	if(hasFlushd) return;
	if(buf === "") return;
	try{
	    fs.writeFileSync(file, buf, "utf8");
	    hasFlushd = true;
	} catch (e){
	    error("Bad write", e);
	}
    }
    function writeLn(line){
	if(line) buf += line;
	buf += "\n";
    }
    appendToExitFns(flush);
    return [writeLn, flush];
}



(function main(args){
    if(args.length < 3) help();
    if(args.length >= 4) veryDebug = true;

    let outdir = args[2];
    let [writelnExpr] = bufferedWriteToFile(path.resolve(outdir, "Expr.java"));
    let [writelnStmt] = bufferedWriteToFile(path.resolve(outdir, "Stmt.java"));

    let exprClasses = [
	{name: "Assign", body: "Token name, Expr value"},
	{name: "Binary", body: "Expr left, Token operator, Expr right"},
	{name: "Call", body: "Expr callee, Token paren, List<Expr> arguments"},
	{name: "Get", body: "Expr object, Token name"},
	{name: "Grouping", body: "Expr expression"},
	{name: "Literal", body: "Object value"},
	{name: "Set", body: "Expr object, Token name, Expr value"},
	{name: "Super", body: "Token keyword, Token method"},
	{name: "This", body: "Token keyword"},
	{name: "Logical", body: "Expr left, Token operator, Expr right"},
	{name: "Unary", body: "Token operator, Expr right"},
	{name: "Variable", body: "Token name"},
    ];

    let stmtClasses = [
	{name: "Block", body: "List<Stmt> statements"},
	{name: "Class", body: "Token name, Expr.Variable superClass, " +
	 "List<Stmt.Function> methods"},
	{name: "Expression", body: "Expr expression"},
	{name: "Function", body: "Token name, List<Token> params, List<Stmt> body"},
	{name: "If", body: "Expr condition, Stmt thenBranch, Stmt elseBranch"},
	{name: "Print", body: "Expr expression"},
	{name: "Return", body: "Token keyword, Expr value"},
	{name: "Var", body: "Token name, Expr initializer"},
	{name: "While", body: "Expr condition, Stmt body"},
    ];

    genSource(exprClasses, "Expr", writelnExpr);
    genSource(stmtClasses, "Stmt", writelnStmt);

    function genSource(classes, prefix, writeln){
	writeln("package com.thmtvz.s2lox;");
	writeln();
	writeln("import java.util.List;");
	writeln("import java.util.ArrayList;");
	writeln();
	writeln("abstract class " + prefix + " {");

	writeln("  interface Visitor<T> {");
	
	for(let c of classes){
	    writeln("    T visit" + c.name + prefix + "(" + c.name + " " + prefix + ");");
	}
	
	writeln("  }");
	writeln();

	writeln("  abstract public String toString();");
	writeln();
	for(let c of classes){
	    let fields = c.body.split(", ");
	    
	    writeln("  static class " + c.name + " extends " + prefix +" {");

	    writeln("    @Override");
	    writeln("    <T> T accept(Visitor<T> visitor){");
	    writeln("      return visitor.visit" + c.name + prefix + "(this);");
	    writeln("    }");
	    writeln();

	    writeln("    @Override");
	    writeln("    public String toString(){");
	    
	    writeln("      List<Object> props = new ArrayList<>();");
	    writeln("      StringBuilder builder = new StringBuilder(); ");	    
	    writeln();
	    for(const field of fields){
		const [fieldType, fieldName] = field.split(" ");
		writeln("      props.add(this." + fieldName + ");");
	    }
	    
	    writeln();
	    
	    writeln("      for(Object o : props){");
	    writeln("          if(o == null) continue;");
	    writeln("          if(o instanceof List){");
	    writeln("            builder.append(" + prefix + ".listToString((List)o));");
	    writeln("            continue;");
	    writeln("          }");
	    writeln("          builder.append(o.toString());");
	    writeln("      }");

	    writeln("      return builder.toString();");
	    
	    writeln("    }");
	    writeln();
	    
	    writeln("    " + c.name + "(" + c.body + "){");
	    for(let field of fields){
		let fieldName = field.split(" ")[1];
		writeln("      " + "this." + fieldName + " = "+ fieldName +";");
	    }
	    writeln("    }");
	    writeln();
	    
	    for(let field of fields){
		writeln("    " + "final " + field + ";");
	    }
	    writeln("  }");
	    writeln();
	}

	writeln("  abstract <T> T accept(Visitor<T> visitor);");

	writeln("  public static <T> String listToString(List<T> list){ ");
	writeln("      StringBuilder builder = new StringBuilder(); ");
	writeln("      for(T element : list){ ");
	writeln("  	builder.append(element.toString()); ");
	writeln("      } ");
	writeln("      return builder.toString(); ");
	writeln("  } ");


	writeln("}");
    }

    return;

})(process.argv);

