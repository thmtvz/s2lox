import S2loxCallable from "S2loxCallable";
import S2loxInstance from "S2loxInstance";
import S2loxClass from "S2loxClass";

type S2ltype = number | string  | boolean | S2loxCallable |
    S2loxInstance | null;

export {S2ltype as default};
