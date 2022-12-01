BUILDDIR := $(realpath .)/build/

java:
	@ echo "Making java"
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR)

javadebug:
	@ echo "Makign java debug"
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR) DEBUG=debug

clean:
	@ echo "Cleaning" $(BUILDDIR)
	@ rm -rf $(BUILDDIR)*

c:
	@ echo "hola"

node:
	@ echo "Making nodejs"
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) node

deno:
	@ echo "Making deno"
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) deno

browser:
	@ echo "Making for browser"
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) browser

all: java javadebug node deno browser

.PHONY: java genast c clean ts
