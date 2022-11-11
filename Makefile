BUILDDIR := $(realpath .)/build/
GENAST	 := tool/genAst.js

$(GENAST):
	@ echo "Generating ast"
	./$(GENAST) java/com/thmtvz/s2lox/

java: $(GENAST)
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR)

javadebug: $(GENAST)
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR) DEBUG=debug

clean:
	@ echo "oi"

.PHONY: java genast c clean
