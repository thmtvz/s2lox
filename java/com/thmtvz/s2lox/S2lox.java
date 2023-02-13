package com.thmtvz.s2lox;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Arrays;

public class S2lox{

    static boolean hadError = false;
    static boolean hadRuntimeError = false;
    private static final Interpreter interpreter = new Interpreter();

    public static void main(String args[]) throws IOException{
	if(args.length > 1 || Arrays.binarySearch(args, "--help") >= 0){
	    System.out.println("jS2lox: S2lox [script] [--help]");
	    System.exit(64);
	} else if(args.length == 1){
	    runScript(args[0]);
	} else {
	    runPrompt();
	}
	return;
    }

    static void runPrompt() throws IOException{
	int lineNo = 1;
	InputStreamReader input = new InputStreamReader(System.in);
	BufferedReader reader = new BufferedReader(input);
	for(;;){
	    System.out.print("[");
	    System.out.print(lineNo);
	    System.out.print("]");
	    System.out.print(" s2lox -> ");
	    String line = reader.readLine();
	    if(line.equals(".exit") || line == null){
		System.out.println("Bye");
		System.exit(0);
	    }
	    run(line);
	    hadError = false;
	    lineNo++;
	}
    }

    static void runScript(String path) throws IOException{
	byte[] bytes = Files.readAllBytes(Paths.get(path));
	run(new String(bytes, Charset.defaultCharset()));
	if(hadError) System.exit(65);
	if(hadRuntimeError) System.exit(70);
	return;
    }

    static void run(String source){
	Scanner scanner = new Scanner(source);
	List<Token> tokens = scanner.scanTokens();

	Parser parser = new Parser(tokens);
	List<Stmt> statements = parser.parse();

	if(hadError) return;

	Resolver resolver = new Resolver(interpreter);
	resolver.resolve(statements);

	if(hadError) return;

	interpreter.interpret(statements);
    }

    static void run(String source, Interpreter interpreter){
	Scanner scanner = new Scanner(source);
	List<Token> tokens = scanner.scanTokens();

	Parser parser = new Parser(tokens);
	List<Stmt> statements = parser.parse();

	if(hadError) return;

	Resolver resolver = new Resolver(interpreter);
	resolver.resolve(statements);

	if(hadError) return;

	interpreter.interpret(statements);
    }

    static void error(Token token, String message){
	if(token.type == TokenType.EOF){
	    report(token.line, " at end", message);
	} else{
	    report(token.line, " at '" + token.lexeme + "'", message);
	}
    }

    private static void report(int line, String where, String message){
	System.err.println("[at " + line + "] Error" +
			   where + ": " + message);
	hadError = true;
    }

    static void runtimeError(RuntimeError error){
	System.out.println(error.getMessage() + "\n[line " + error.token.line + "]");
	hadRuntimeError = true;
    }
}
