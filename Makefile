BUILDDIR := $(realpath .)/build/

java:
	@ echo "Making java"
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR)

javadebug:
	@ echo "Making java debug"
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR) DEBUG=debug

c:
	@ $(MAKE) -C c BUILDDIR=$(BUILDDIR)

clean:
	@ echo "Cleaning" $(BUILDDIR)
	@ rm -rf $(BUILDDIR)*

c:
	@ echo "hola"

node:
	@ echo "Making nodejs"
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) n

deno:
	@ echo "Making deno"
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) d

browser:
	@ echo "Making for browser"
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) b

all: java node deno browser

.PHONY: java genast c clean ts
