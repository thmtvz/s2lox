import Scanner from "Scanner";
import Token from "Token";
import TokenType from "TokenType";
import Interpreter from "Interpreter";
import RuntimeError from "RuntimeError";
import Parser from "Parser";
import Resolver from "Resolver";

export default class Runner{

    private hadError: boolean = false;
    private hadRuntimeError: boolean = false;
    private readonly interpreter:  Interpreter;

    constructor(
	public readonly readline: () => string,
	public readonly readfile: (s: string) => string,
	public readonly output: (o: string) => void
    ){
	this.interpreter = new Interpreter(this);
    }

    public runPrompt(): void{
	let lineNo = 1;
	for(;;){
	    this.output("[" + lineNo.toString() + "]" +
		" s2lox -> ");
	    const line = this.readline();
	    if(line === ".exit" || line === ""){
		this.output("Bye");
		process.exit(0);
	    }
	    this.run(line);
	    this.hadError = false;
	    ++lineNo;
	}
    }

    public runScript(path: string){
	const source = this.readfile(path);
	this.run(source);
	if(this.hadError) process.exit(65);
	if(this.hadRuntimeError) process.exit(70);
	return;
    }

    public run(source: string): void{
	const scanner = new Scanner(this, source);
	const tokens = scanner.scanTokens();

	const parser = new Parser(this, tokens);
	const statements = parser.parse();

	if(this.hadError) return;

	const resolver = new Resolver(this, this.interpreter);
	resolver.resolve(statements);

	if(this.hadError) return;

	this.interpreter.interpret(statements);
    }

    public error(tok: Token, message: string){
	if(tok.t == TokenType.EOF){
	    this.report(tok.line, " at end", message);
	} else this.report(tok.line, " at '" + tok.lexeme + "'", message);
    }
    
    private report(line: number, where: string,
			 message: string): void{
	this.output("[at " + line + "] Error" + where + ": " + message);
	this.hadError = true;
    }

    public runtimeError(e: RuntimeError){
	if(e !== undefined){
	    this.output(`${e.message ? e.message : ""}\n[line ${e.token ? e.token.line : ""}]`);
	}
	this.hadRuntimeError = true;
    }
}
