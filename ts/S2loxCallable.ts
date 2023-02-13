import S2ltype from "./S2ltype.js";
import Interpreter from "./Interpreter.js";

export default interface S2loxCallable {
    arity(): number;
    call(interpreter: Interpreter, args: S2ltype[]): S2ltype;
}
