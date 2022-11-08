# using make because this project is very simple in nature,
# and hold have no dependencies

MAIN	   := S2lox
DIRSTRUCT  := com/thmtvz/s2lox/
TARGETDIR  ::= $(BUILDDIR)$(DIRSTRUCT)
SOURCES	   := $(DIRSTRUCT)*.java
MAINCLASS  := $(TARGETDIR)$(addsuffix .class, $(MAIN))
MAINSOURCE := $(DIRSTRUCT)$(addsuffix .java, $(MAIN))
JC	   := javac
OPTS	   := -Werror -d $(BUILDDIR)

java: clean
	@ echo "Building script"
	@ echo "#!/usr/bin/env sh" > $(BUILDDIR)jS2lox
	@ echo java -jar $(BUILDDIR)S2lox.jar $$\* >> $(BUILDDIR)jS2lox
	@ chmod +x $(BUILDDIR)jS2lox
	@ echo "Done"

$(MAINCLASS): $(SOURCES)
	@ echo "Compiling sources" 
	@ $(JC) $(OPTS) $(MAINSOURCE)

archive: $(MAINCLASS)
	@ echo "Compressing into jar file"
	@ cd $(BUILDDIR) && jar cfe $(MAIN).jar $(subst /,.,$(DIRSTRUCT))$(MAIN) $(DIRSTRUCT)*.class

clean: archive
	@ echo "Cleaning build directory"


.PHONY: clean archive
