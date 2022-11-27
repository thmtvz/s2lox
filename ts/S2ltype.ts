import S2loxCallable from "./S2loxCallable.js";
import S2loxInstance from "./S2loxInstance.js";
import S2loxClass from "./S2loxClass.js";

type S2ltype = number | string  | boolean | S2loxCallable |
    S2loxInstance | null;

export {S2ltype as default};
