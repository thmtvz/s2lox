package com.thmtvz.s2lox;

import java.util.List;

interface S2loxCallable{
    int arity();
    Object call(Interpreter interpreter, List<Object> arguments);
}
