import Scanner from "./Scanner";
import Token from "./Token";
import TokenType from "./TokenType";
import Interpreter from "./Interpreter";

export default class Runner{

    private hadError: boolean = false;
    private hadRuntimeError: boolean = false;
    private readonly interpreter: Interpreter = new Interpreter();

    constructor(
	private readonly readline: () => string,
	private readonly readfile: (s: string) => string,
	private readonly output: (o: string) => void
    ){}

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

	const parser = new Parser(tokens);
	const statements = parser.parse();

	if(this.hadError) return;

	const resolver = new Resolver(this.interpreter);
	resolver.resolve(statements);

	if(this.hadError) return;

	this.interpreter.interpret(statements);
    }

    public error(tok: Token, message: string){
	if(tok.type == TokenType.EOF){
	    this.report(tok.line, " at end", message);
	} else this.report(tok.line, " at '" + tok.lexeme + "'", message);
    }
    
    private report(line: number, where: string,
			 message: string): void{
	this.output("[at " + line + "] Error" + where + ": " + message);
	this.hadError = true;
    }

    public runtimeError(e: runtimeError){
	this.output(e.getMessage()/*fixthis*/ + "\n[line " +
	    e.token.line + "]");
	this.hadRuntimeError = true;
    }
}
