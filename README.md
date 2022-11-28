# s2lox (started life as lox)

s2lox is a small toy language based on [the lox language](https://craftinginterpreters.com) with some 
flavour of mine on top of it.

Currently on development.

## Getting it

```bash
git clone https://github.com/thmtvz/s2lox && cd s2lox
make java
./build/jS2lox resources/examples/hello.lx #😄
./build/tsS2lox resources/examples/hello.lx 
```

### Depends on:

- jar
- tsc
- make
- java
- javac
- nodejs
- coreutils


## Examples

- The most important program ever:
```
print "Hello, world!"; //Hello, world!
```

- Recursive fibonacci:
```
fun fib(n){
	if(n < 2) return n;
	return fib(n - 1) + fib(n - 2);
}

var result = fib(12);

print result; //144
```
