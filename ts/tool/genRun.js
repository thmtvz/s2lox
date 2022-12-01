const fs = require("node:fs");
const path = require("node:path");
var exitFns = [];

process.on("exit", (c) => {
    if (!c){
	exitFns.forEach((fn) => {
	    fn();
	})
    }
    return;
});

function appendToExitFns(fn){
    exitFns.push(fn);
    return;
}

function help(){
    error("Usage: ./genRun.js OUTDIR PLATAFORM");
}

function error(message, e, code = 1){
    veryDebug ? console.log(e) : console.log(message);
    process.exit(code);
}

function bufferedWriteToFile(filepath){
    let file;
    let hasFlushd = false;
    try{
	file = path.resolve(filepath);
    } catch (e){
	error("Bad filename", e);
    }
    let buf = "";
    function flush(){
	if(hasFlushd) return;
	if(buf === "") return;
	try{
	    fs.writeFileSync(file, buf, "utf8");
	    hasFlushd = true;
	} catch (e){
	    error("Bad write", e);
	}
    }
    function writeLn(line){
	if(line) buf += line; //overloading 😄😄
	buf += "\n";
    }
    appendToExitFns(flush);
    return [writeLn, flush];
}



(function main(args){
        
    const outdir = args[2];
    const plataform = args[3];
    const file = `${outdir}${plataform}S2lox`;
    const [writeln] = bufferedWriteToFile(path.resolve(file));

    writeln("#!/usr/bin/sh");
    writeln();
    if(plataform === "deno"){
	writeln(`deno run --allow-read --allow-write ${outdir}${plataform}JsBuild/main.js $@`);
    }else {
	writeln(`node ${outdir}${plataform}JsBuild/main.js $@`);
    }

})(process.argv);
