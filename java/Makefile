# using make because this project is very simple in nature,
# and hold have no dependencies

MAIN	   := S2lox
DIRSTRUCT  := com/thmtvz/s2lox/
TARGETDIR  := $(BUILDDIR)$(DIRSTRUCT)
SOURCES	   := $(DIRSTRUCT)*.java
MAINCLASS  := $(TARGETDIR)$(addsuffix .class, $(MAIN))
MAINSOURCE := $(DIRSTRUCT)$(addsuffix .java, $(MAIN))
SCRIPTNAME := $(BUILDDIR)jS2lox$(DEBUG)
JC	   := javac
DEBUGFLAG  := -g
OPTS	   := -Werror -d $(BUILDDIR)
LINT	   := -Xlint:unchecked
JARNAME := $(MAIN)$(DEBUG)

java: archive
	@ echo "Building script"
	@ echo "#!/usr/bin/env sh" > $(SCRIPTNAME)
	@ echo java -jar $(BUILDDIR)S2lox.jar $$\* >> $(SCRIPTNAME)
	@ chmod +x $(SCRIPTNAME)
	@ echo "Done"

$(MAINCLASS): $(SOURCES)
	@ echo "Compiling sources"
ifeq ($(strip $(DEBUG)),)
	@ $(JC) $(LINT) $(OPTS) $(MAINSOURCE)
else
	@ $(JC) $(DEBUGFLAG) $(LINT) $(OPTS) $(MAINSOURCE)
endif

archive: $(MAINCLASS)
	@ echo "Compressing into jar file"
	@ cd $(BUILDDIR) && jar cfe $(JARNAME).jar $(subst /,.,$(DIRSTRUCT))$(MAIN) $(DIRSTRUCT)*.class

clean: 
	@ echo "Cleaning build directory"

.PHONY: clean archive
