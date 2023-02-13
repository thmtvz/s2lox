# s2lox (started life as lox)

s2lox is a small toy language based on [the lox language](https://craftinginterpreters.com) with some 
flavour of mine on top of it.

Currently on development.

## Getting it

```bash
git clone https://github.com/thmtvz/s2lox && cd s2lox
make all
./build/jS2lox resources/examples/hello.lx 
./build/tsS2lox resources/examples/hello.lx 
```

### Depends on:

- jar
<<<<<<< HEAD
=======
- npm
>>>>>>> 88b989a8ec1edc2f43ea62970ea4a1d415b32c91
- tsc
- make
- java
- javac
- nodejs
- coreutils

<<<<<<< HEAD
```bash
git clone https://github.com/thmtvz/s2lox && cd s2lox
make java
./build/jS2lox resources/examples/hello.lx #😄
./build/tsS2lox resources/examples/hello.lx 
```
=======
>>>>>>> 88b989a8ec1edc2f43ea62970ea4a1d415b32c91

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
