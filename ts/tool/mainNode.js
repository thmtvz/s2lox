const Runner = require("./Runner.js").default; //??
const readFileSync = require("node:fs").readFileSync;
const readSync = require("node:fs").readSync;
const writeSync = require("node:fs").writeSync;
const resolve = require("node:path").resolve;

function readfile(filename){
    let contents = readFileSync(resolve(filename));
    return contents.toString();
}

function readline(prompt){
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
	process.exit
    );
    if(args.indexOf("--help") >= 0){
	console.log("nodeS2lox: S2lox [script] [--help]");
	process.exit(64);
    } else if(args.length === 3){
	runner.runScript(args[2]);
    } else {
	runner.runPrompt();
    }
})(process.argv);
