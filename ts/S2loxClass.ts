import S2loxCallable from "S2loxCallable";
import S2loxFunction from "S2loxFunction";
import S2loxInstance from "S2loxInstace";
import S2ltype from "S2ltype";

export defalt class S2loxClass implements S2loxCallable{
    constructor(
	public readonly name: string,
	public readonly superClass: S2loxClass,
	private readonly methods: S2loxFunction[],
    ) {}

    public findMethod(String name): S2loxFunction | null{
	if(methods.has(name)){
	    return methods.get(name);
	}

	if(superClass != null){
	    return superClass.findMethod(name);
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
	    initializer.bind(instance).call(interpreter, arguments);
	}
	return instance;
    }
}
