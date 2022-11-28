# using make because this project is very simple in nature,
# and hold have no java dependencies

MAIN	   := S2lox
DIRSTRUCT  := com/thmtvz/s2lox/
TARGETDIR  := $(DEBUG)$(BUILDDIR)$(DIRSTRUCT)
SOURCES	   := $(DIRSTRUCT)*.java
MAINCLASS  := $(TARGETDIR)$(addsuffix .class, $(MAIN))
MAINSOURCE := $(DIRSTRUCT)$(addsuffix .java, $(MAIN))
SCRIPTNAME := $(BUILDDIR)jS2lox
JC	   := javac
DEBUGFLAG  := -g
OPTS	   := -Werror -d $(BUILDDIR)$(DEBUG)
LINT	   := -Xlint:unchecked
JARNAME	   := $(MAIN)
ASTSOURCE  := $(DIRSTRUCT)Stmt.java $(DIRSTRUCT)Expr.java 

$(ASTSOURCE):
	@ node tool/genAst.js $(DIRSTRUCT)

$(TARGETDIR)$(SCRIPTNAME): $(TARGETDIR)$(JARNAME)
ifeq ($(strip $(DEBUG)),)
	@ echo "Building script"
	@ echo "#!/usr/bin/env sh" > $(SCRIPTNAME)
	@ echo java -jar $(BUILDDIR)S2lox.jar $$\* >> $(SCRIPTNAME)
	@ chmod +x $(SCRIPTNAME)
	@ echo "Done"
endif

$(TARGETDIR)$(JARNAME): $(MAINCLASS)
ifeq ($(strip $(DEBUG)),)
	@ echo "Compressing into jar file"
	@ cd $(BUILDDIR) && jar cfe $(JARNAME).jar $(subst /,.,$(DIRSTRUCT))$(MAIN) $(DIRSTRUCT)*.class
endif

$(MAINCLASS): $(SOURCES) $(ASTSOURCE)
	@ echo "Compiling sources"
ifeq ($(strip $(DEBUG)),)
	@ $(JC) $(LINT) $(OPTS) $(MAINSOURCE)
else
	@ $(JC) $(DEBUGFLAG) $(LINT) $(OPTS) $(MAINSOURCE)
endif

.PHONY: 
