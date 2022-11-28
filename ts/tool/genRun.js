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
    error("Usage: ./genExprClass.js OUTDIR [veryDebug]");
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
        
    let outdir = args[2];
    let [writeln] = bufferedWriteToFile(path.resolve(outdir + "tsS2lox"));

    writeln("#!/usr/bin/sh");
    writeln();
    writeln(`cd ${path.resolve(outdir + "jsBuild")} && node main.js`);
    
})(process.argv);
