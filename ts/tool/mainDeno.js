import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";
import Runner from "./Runner.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function readfile(filename){
    return Deno.readTextFileSync(resolve(filename));
}

function readline(prompt){
    if(prompt){
	Deno.writeSync(1, encoder.encode(prompt));
    }
    let buf = new Uint8Array(1024);
    const read = Deno.readSync(0, buf);
    return decoder.decode(buf.slice(0, read)).replace("\n", "");
}

function output(o){
    console.log(o);
    return;
}

(function main(args){
    const runner = new Runner(
	readline,
	readfile,
	output,
	Date.now,
	Deno.exit
    );
    if(args.indexOf("--help") >= 0){
	console.log("denoS2lox: S2lox [script] [--help]");
	Deno.exit(64);
    } else if(args.length === 1){
	runner.runScript(args[0]);
    } else {
	runner.runPrompt();
    }
})(Deno.args);
