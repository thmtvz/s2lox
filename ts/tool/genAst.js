const fs = require("node:fs");
const path = require("node:path");

var veryDebug = false;

//hooks
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
	if(line) buf += line; //overloading 😄😄
	buf += "\n";
    }
    appendToExitFns(flush);
    return [writeLn, flush];
}



(function main(args){
    if(args.length < 3) help();
    if(args.length >= 4) veryDebug = true;

    let outdir = args[2];
    let [writelnExpr] = bufferedWriteToFile(path.resolve(outdir, "Expr.ts"));
    let [writelnStmt] = bufferedWriteToFile(path.resolve(outdir, "Stmt.ts"));

    let exprClasses = [
	{name: "Assign",	body: "Token name, Expr value"},
	{name: "Binary",	body: "Expr left, Token operator, Expr right"},
	{name: "Call",		body: "Expr callee, Token paren, Expr[] args"},
	{name: "Get",		body: "Expr obj, Token name"},
	{name: "Grouping",	body: "Expr expression"},
	{name: "Literal",	body: "S2ltype value"},
	{name: "Set",		body: "Expr obj, Token name, Expr value"},
	{name: "Super",		body: "Token keyword, Token method"},
	{name: "This",		body: "Token keyword"},
	{name: "Logical",	body: "Expr left, Token operator, Expr right"},
	{name: "Unary",		body: "Token operator, Expr right"},
	{name: "Variable",	body: "Token name"},
    ];

    let stmtClasses = [
	{name: "Noop",          body: ""},
	{name: "Import",	body: "Token name"},
	{name: "Block",		body: "Stmt[] statements"},
	{name: "Class",		body: "Token name, VariableExpr|null superClass, " +
	 "FunctionStmt[] methods"},
	{name: "Expression",	body: "Expr expression"},
	{name: "Function",	body: "Token name, Token[] params, Stmt[] body"},
	{name: "If",		body: "Expr condition, Stmt thenBranch, Stmt|null elseBranch"},
	{name: "Print",		body: "Expr expression"},
	{name: "Return",	body: "Token keyword, Expr|null value"},
	{name: "Var",		body: "Token name, Expr|null initializer"},
	{name: "While",		body: "Expr condition, Stmt body"},
    ];

    genSource(exprClasses, "Expr", writelnExpr);
    genSource(stmtClasses, "Stmt", writelnStmt);

    function genSource(classes, prefix, writeln){
	writeln("import Token from \"Token\";");
	writeln("import S2ltype from \"S2ltype\";");
	if(prefix === "Stmt"){
	    writeln("import { Expr } from \"Expr\";");
	    for(let c of exprClasses){
		const name = c.name;
		writeln("import { " + name + "Expr" + " } from \"Expr\";");
	    }

	}
	writeln();

	writeln("export interface " + prefix + "{");
	writeln("  accept<T>(visitor: " + prefix + "Visitor<T>): T");
	writeln("}");

	writeln();

	writeln("export interface " + prefix + "Visitor <T>{")
	for(let c of classes){
	    const name = c.name;
	    writeln("  visit" + name + prefix + "(" +
		    prefix.toLowerCase() + ": " + name +
		    prefix + "): T;");
	}
	writeln("}");
	writeln();

	for(let c of classes){
	    const name = c.name;
	    const bodyFields = c.body.split(", ");

	    writeln("export class " + name + prefix + " implements " +
		    prefix +"{");

	    if(!(bodyFields[0] === "")){
		writeln("  constructor(");
		
		for(let f of bodyFields){
		    let [type, name] = f.split(" ");
		    writeln("    public " + name + ": " + type + ",");
		}

		writeln("  ) {}");
	    } else {
		writeln("  constructor () {}");
	    }
	    writeln();
	    
	    writeln("  accept <T>(visitor: " + prefix + "Visitor<T>): T{");
	    writeln("    return visitor.visit" + name + prefix + "(this);");
	    writeln("  }");
	    writeln("}");
	    writeln();
	}
    }
    
    return;
})(process.argv);
