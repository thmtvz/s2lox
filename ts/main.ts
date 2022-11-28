import Runner from "./Runner.js";
import { readFileSync } from "node:fs";
import { readSync } from "node:fs";
import { writeSync } from "node:fs";
import { resolve } from "node:path";

function readfile(filename: string): string{
    let contents = readFileSync(resolve(filename));
    return contents.toString();
}

function readline(prompt?: string): string{
    if(prompt){
	writeSync(1, prompt);
    }
    let buf = Buffer.alloc(1024);
    let p = 0;
    while(buf.slice(0, p).toString().indexOf("\n") === -1){
	readSync(0, buf, p, 1, -1);
	++p;
    }
    return buf.slice(0, p).toString().replace("\n", "");
}

function output(o: string): void{
    console.log(o);
    return;
}

(function main(args){
    const runner = new Runner(
	readline,
	readfile,
	output,
	Date.now,
    );
    if(args.indexOf("--help") >= 0){
	console.log("tsS2lox: S2lox [script] [--help]");
	process.exit(64);
    } else if(args.length === 3){
	runner.runScript(args[2]);
    } else {
	runner.runPrompt();
    }
})(process.argv);
