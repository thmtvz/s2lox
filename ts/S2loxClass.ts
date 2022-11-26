import Interpreter from "Interpreter";
import S2loxCallable from "S2loxCallable";
import S2loxFunction from "S2loxFunction";
import S2loxInstance from "S2loxInstance";
import S2ltype from "S2ltype";

export default class S2loxClass implements S2loxCallable{
    constructor(
	public readonly name: string,
	public readonly superClass: S2loxClass | null,
	private readonly methods: Map<string, S2loxFunction>,
    ) {}

    public findMethod(name: string): S2loxFunction | null{
	if(this.methods.has(name)){
	    let method = this.methods.get(name);
	    if(method === undefined) return null;
	    return method;
	}

	if(this.superClass != null){
	    return this.superClass.findMethod(name);
	}

	return null;
    }

    public toString(): string{
	return `<class ${this.name}>`;
    }

    public arity(): number{
	let initializer = this.findMethod("init");
	if(initializer == null) return 0;
	return initializer.arity();
    }

    public call(interpreter: Interpreter, args: S2ltype[]): S2ltype{
	let instance = new S2loxInstance(this);
	let initializer = this.findMethod("init");
	if(initializer !== null){
	    initializer.bind(instance).call(interpreter, args);
	}
	return instance;
    }
}
