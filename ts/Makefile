ASTFILES := Stmt.ts Expr.ts

$(ASTFILES):
	@ npm install --silent
	@ node ./tool/genAst.js .

node: $(ASTFILES)
	@ echo "Compiling typescript into cjs modules"
	@ tsc -outDir $(BUILDDIR)jsBuild --pretty false -m commonjs
	@ node ./tool/genRun.js $(BUILDDIR);
	@ chmod +x $(BUILDDIR)tsS2lox


browser: $(ASTFILES)
	@ echo "Compiling typescript into broser amd modules"
	@ tsc -outFile $(BUILDDIR)s2l.js --pretty false -m amd

deno:
	@ echo "Oi"


.PHONY: node deno browser
