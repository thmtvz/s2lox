import Runner from "Runner";
import readline from "node:readline/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readfile(filename: string): string{
    return readFileSync(resolve(filename)).toString();
}

async function rl(prompt: string): Promise<string>{
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    const a = await rl.question(prompt);
    rl.close();
    return a.toString();
}

function output(o: string): void{
    console.log(o);
    return;
}

(function main(args){
    const runner = new Runner(
	rl,
	readfile,
	output,
    );
    if(args.length > 1 || args.indexOf("--help") >= 0){
	console.log("tsS2lox: S2lox [script] [--help]");
	process.exit(64);
    } else if(args.length === 1){
	runner.runScript(args[0]);
    } else {
	runner.runPrompt();
    }
})(process.argv);
