import Runner from "Runner";

(function main(args){
    //runner will take care of input and output
    //readline, readfile, output stream
    const runner = new Runner();
    if(args.length > 1 || args.indexOf("--help") >= 0){
	console.log("tsS2lox: S2lox [script] [--help]");
	process.exit(64);
    } else if(args.length == 1){
	//runScript(args[]);
    }
})(process.argv);
