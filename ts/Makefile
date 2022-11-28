ASTFILES := Stmt.ts Expr.ts

$(ASTFILES):
	@ node ./tool/genAst.js .

all: $(ASTFILES)
	@ tsc -outDir $(BUILDDIR)releaseJs
	@ node ./tool/genRun.js $(BUILDDIR);
	@ chmod +x $(BUILDDIR)tsS2lox


.default: all

.PHONY: all
