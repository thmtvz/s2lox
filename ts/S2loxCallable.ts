import S2ltype from "./S2ltype";
import Interpreter from "./Interpreter";

export default interface S2loxCallable {
    arity(): number;
    call(interpreter: Interpreter, args: S2ltype[]): S2ltype;
}
