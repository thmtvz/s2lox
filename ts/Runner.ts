import Scanner from "./Scanner.js";
import Token from "./Token.js";
import TokenType from "./TokenType.js";
import Interpreter from "./Interpreter.js";
import RuntimeError from "./RuntimeError.js";
import Parser from "./Parser.js";
import Resolver from "./Resolver.js";

export default class Runner{

    private hadError: boolean = false;
    private hadRuntimeError: boolean = false;
    private readonly interpreter:  Interpreter = new Interpreter(this);

    constructor(
	public readonly readline: (p?: string) => string,
	public readonly readfile: (s: string) => string,
	public readonly output: (o: string) => void,
	public readonly clock: () => number,
    ) {}

    public runPrompt(): void{
	let lineNo = 1;
	for(;;){
	    const line = this.readline(`[${lineNo}] s2lox -> `);
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
