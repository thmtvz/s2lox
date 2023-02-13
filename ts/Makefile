ASTFILES := Stmt.ts Expr.ts

$(ASTFILES):
	@ echo "Generating Ast files"
	@ npm install --silent
	@ node ./tool/genAst.js .

n: $(ASTFILES)
	@ echo "Compiling typescript to nodejs"
	@ tsc -outDir $(BUILDDIR)nodeJsBuild --pretty false -m commonjs
	@ node ./tool/genRun.js $(BUILDDIR) node
	@ cp tool/mainNode.js $(BUILDDIR)nodeJsBuild/main.js
	@ chmod +x $(BUILDDIR)nodeS2lox

b: $(ASTFILES)
	@ echo "Compiling typescript into broser amd modules"
	@ tsc -outFile $(BUILDDIR)s2l.js --pretty false -m amd

d: $(ASTFILES)
	@ echo "Compiling typescript to deno"
	@ tsc -outDir $(BUILDDIR)denoJsBuild --pretty false -m es6
	@ node ./tool/genRun.js $(BUILDDIR) deno
	@ cp tool/mainDeno.js $(BUILDDIR)denoJsBuild/main.js
	@ chmod +x $(BUILDDIR)denoS2lox

.PHONY: n d b
