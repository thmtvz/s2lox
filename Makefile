BUILDDIR := $(realpath .)/build/

test:
	@ echo $(BUILDDIR)

genast: 
	@ echo "Running AST generator"
	@ tool/genAst.js java/com/thmtvz/s2lox

java: genast
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR) 

javadebug: genast
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR) DEBUG=debug

clean:
	@ echo "oi"

.PHONY: java genast c clean
