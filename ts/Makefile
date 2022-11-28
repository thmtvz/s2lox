ASTFILES := Stmt.ts Expr.ts

$(ASTFILES):
	@ npm install
	@ node ./tool/genAst.js .

all: $(ASTFILES)
	@ tsc -outDir $(BUILDDIR)jsBuild --pretty false
	@ node ./tool/genRun.js $(BUILDDIR);
	@ chmod +x $(BUILDDIR)tsS2lox


.default: all

.PHONY: all
