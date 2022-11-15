import token from "./token";
import tokenType from "./tokenType";
import runner from "./runner";

class Scanner {
    private readonly source: string;
    private readonly tokens: token[];
    private static readonly keywords = {
	"and"		:	 tokenType.AND,
	"class"		:	 tokenType.CLASS,
	"else"		:	 tokenType.ELSE,
	"false"		:	 tokenType.FALSE,
	"for"		:	 tokenType.FOR,
	"fun"		:	 tokenType.FUN,
	"if"		:	 tokenType.IF,
	"nil"		:	 tokenType.NIL,
	"or"		:	 tokenType.OR,
	"print"		:	 tokenType.PRINT,
	"return"	:	 tokenType.RETURN,
	"super"		:	 tokenType.SUPER,
	"this"		:	 tokenType.THIS,
	"true"		:	 tokenType.TRUE,
	"var"		:	 tokenType.VAR,
	"while"		:	 tokenType.WHILE,
	"import"	:	 tokenType.IMPORT,
    };
    private start = 0;
    private current = 0;
    private line = 1;

    constructor(src){
	this.source = src;
    }

    scanTokens(): token[]{
	while(1){
	    this.start = this.current;
	    this.scanToken();
	}
	this.tokens.push(new token(tokenType.EOF, "", null, this.line));
	return this.tokens;
    }
    
    scanToken(): void{
	const char = this.advance();
	switch (char) {
	case '(': this.addToken(tokenType.LEFT_PAREN); break;
	case ')': this.addToken(tokenType.RIGHT_PAREN); break;
	case '{': this.addToken(tokenType.LEFT_BRACE); break;
	case '}': this.addToken(tokenType.RIGHT_BRACE); break;
	case ',': this.addToken(tokenType.COMMA); break;
	case '.': this.addToken(tokenType.DOT); break;
	case '-': this.addToken(tokenType.MINUS); break;
	case '+': this.addToken(tokenType.PLUS); break;
	case ';': this.addToken(tokenType.SEMICOLON); break;
	case '*': this.addToken(tokenType.STAR); break;
	case '!':
	    this.addToken(this.match('=') ? tokenType.BANG_EQUAL : tokenType.BANG);
	    break;
	case '=':
	    this.addToken(this.match('=') ? tokenType.EQUAL_EQUAL : tokenType.EQUAL);
	    break;
	case '<':
	    this.addToken(this.match('=') ? tokenType.LESS_EQUAL : tokenType.LESS);
	    break;
	case '>':
	    this.addToken(this.match('=') ? tokenType.GREATER_EQUAL : tokenType.GREATER);
	    break;
	case '/':
	    if(this.match('/')){
		while(this.peek() != '\n' && !this.isAtEnd()) this.advance();
	    } else {
		this.addToken(tokenType.SLASH);
	    }
	    break;
	case '\n':
	    ++this.line;
	    break;
	case ' ':
	case '\t':
	case '\r':
	    break;
	case '"': this.stringLiteral(); break;
	default:
	    if(this.isDigit(char)){
		this.numberLiteral();
	    } else if(this.isAlpha(char)){
		this.identifier();
	    } else {
		//make the runner thing
		//WRONG!!
		runner.error(new token(tokenType.EOF, "", null, this.line), "Unexpected character.");
	    }
	    break;
	}
    }
    
    private advance(): string{
	++this.current;
	return this.source[this.current - 1];
    }

    private match(expected: string): boolean{
	if(this.isAtEnd()) return false;
	if(this.source[this.current] != expected) return false;
	++this.current;
	return true;
    }

    private addToken(t: tokenType, literal?: Object): void{
	const text = this.source.slice(this.start, this.current);
	if(!literal){
	    this.tokens.push(new token(t, text, null, this.line));
	    return;
	}
	this.tokens.push(new token(t, text, literal, this.line));
    }

    private peek(): string{
	if(this.isAtEnd()) return "\0";
	return this.source[this.current];
    }

    private isAtEnd(): boolean{
	return this.current >= this.source.length;
    }

    private stringLiteral(): void{
	while(this.peek() != '"' && !this.isAtEnd()){
	    if(this.peek() == "\n") ++this.line;
	    this.advance();
	}
	if(this.isAtEnd()){
	    //Runner error
	    return;
	}
	this.advance();
	const value = this.source.slice(this.start + 1,
					this.current - 1);
	this.addToken(tokenType.STRING, value);
    }

    private isDigit(c: string): boolean{
	return c >= "0" && c <= "9";
    }

    private numberLiteral(): void{
	while(this.isDigit(this.peek())) this.advance();
	if(this.peek() == "." && this.isDigit(this.peekNext())){
	    this.advance();
	    while(this.isDigit(this.peek())) this.advance();
	}
	this.addToken(tokenType.NUMBER, parseFloat(
	    this.source.slice(this.start, this.current)));
    }

    private isAlpha(c: string): boolean{
	return (c >= "a" && c <= "z") ||
	    (c >= 'A' && c <= 'Z') ||
	    (c == '_');
    }

    private identifier(): void{
	while(this.isAlphaNumeric(this.peek())) this.advance();
	const text = this.source.slice(this.start, this.current);
	let t = Scanner.keywords[text];
	if(t == undefined) t = tokenType.IDENTIFIER;
	this.addToken(t);
    }

    private isAlphaNumeric(c: string): boolean{
	return this.isAlpha(c) || this.isDigit(c);
    }

    private peekNext(): string{
	if(this.current + 1 >= this.source.length) return "\0";
	return this.source[this.current + 1];
    }
}
