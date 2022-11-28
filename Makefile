BUILDDIR := $(realpath .)/build/

java:
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR)

javadebug:
	@ $(MAKE) -C java BUILDDIR=$(BUILDDIR) DEBUG=debug

clean:
	@ rm -rf $(BUILDDIR)*

c:
	@ echo "hola"

ts:
	@ $(MAKE) -C ts BUILDDIR=$(BUILDDIR) all

all: java ts

.PHONY: java genast c clean ts
