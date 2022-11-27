import Token from "./Token.js";
import TokenType from "./TokenType.js";
import Runner from "./Runner.js";

export default class Scanner {
    private readonly tokens: Token[] = [];
    private static readonly keywords: {[k: string]: TokenType} = {
	'"and"'		:	 TokenType.AND,
	'"class"'	:	 TokenType.CLASS,
	'"else"'	:	 TokenType.ELSE,
	'"false"'	:	 TokenType.FALSE,
	'"for"'		:	 TokenType.FOR,
	'"fun"'		:	 TokenType.FUN,
	'"if"'		:	 TokenType.IF,
	'"nil"'		:	 TokenType.NIL,
	'"or"'		:	 TokenType.OR,
	'"print"'	:	 TokenType.PRINT,
	'"return"'	:	 TokenType.RETURN,
	'"super"'	:	 TokenType.SUPER,
	'"this"'	:	 TokenType.THIS,
	'"true"'	:	 TokenType.TRUE,
	'"var"'		:	 TokenType.VAR,
	'"while"'	:	 TokenType.WHILE,
	'"import"'	:	 TokenType.IMPORT,
	'"noop"'        :        TokenType.NOOP,
    };
    private start = 0;
    private current = 0;
    private line = 1;

    constructor(
	private readonly runner: Runner,
	private readonly source: string,
    ) {}

    scanTokens(): Token[]{
	while(1){
	    this.start = this.current;
	    this.scanToken();
	}
	this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
	return this.tokens;
    }
    
    scanToken(): void{
	const char = this.advance();
	switch (char) {
	case '(': this.addToken(TokenType.LEFT_PAREN); break;
	case ')': this.addToken(TokenType.RIGHT_PAREN); break;
	case '{': this.addToken(TokenType.LEFT_BRACE); break;
	case '}': this.addToken(TokenType.RIGHT_BRACE); break;
	case ',': this.addToken(TokenType.COMMA); break;
	case '.': this.addToken(TokenType.DOT); break;
	case '-': this.addToken(TokenType.MINUS); break;
	case '+': this.addToken(TokenType.PLUS); break;
	case ';': this.addToken(TokenType.SEMICOLON); break;
	case '*': this.addToken(TokenType.STAR); break;
	case '!':
	    this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
	    break;
	case '=':
	    this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
	    break;
	case '<':
	    this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
	    break;
	case '>':
	    this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
	    break;
	case '/':
	    if(this.match('/')){
		while(this.peek() != '\n' && !this.isAtEnd()) this.advance();
	    } else {
		this.addToken(TokenType.SLASH);
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
		this.runner.error(new Token(TokenType.EOF, "", null, this.line), "Unexpected character.");
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

    private addToken(t: TokenType, literal?: Object): void{
	const text = this.source.slice(this.start, this.current);
	if(!literal){
	    this.tokens.push(new Token(t, text, null, this.line));
	    return;
	}
	this.tokens.push(new Token(t, text, literal, this.line));
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
	this.addToken(TokenType.STRING, value);
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
	this.addToken(TokenType.NUMBER, parseFloat(
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
	let t: TokenType;
	t = Scanner.keywords[text];
	if(t == undefined) t = TokenType.IDENTIFIER;
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
