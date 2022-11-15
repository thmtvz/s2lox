import token from "./token";

export default class runner{

    private static hadError: boolean = false;

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
	    runner.hadError = false;
	    ++lineNo;
	}
    }

    public runScript(path: string){
	const source = this.readfile(path);
	this.run(source);
	if(runner.hadError) process.exit(65);
	if(runner.hadRuntimeError) process.exit(70);
	return;
    }

    public run(source: string, interpreter?: interpreter): void{
	interpreter = interpreter || runner.interpreter;

	const scanner = new scanner(source);
	const tokens = scanner.scanTokens();

	const parser = new Parser(tokens);
	const statements = parser.parse();

	if(runner.hadError) return;

	const resolver = new resolver(interpreter);
	resolver.resolve(statements);

	if(runner.hadError) return;

	interpreter.interpret(statements);
    }

    public static error(tok: token, message){
	if(tok.type == tokenType.EOF){
	    runner.report(tok.line, " at end", message);
	} else runner.report(tok.line, " at '" + tok.lexeme + "'", message);
    }
    
    public static report(line: number, where: string,
			 message: string): void{
	this.output("[at " + line + "] Error" + where + ": " + message);
	runner.hadError = true;
    }

    public static runtimeError(e: runtimeError){
	this.output(e.getMessage()/*fixthis*/ + "\n[line " +
	    e.token.line + "]");
	runner.hadRuntimeError = true;
    }
}
