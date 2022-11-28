import Token from "Token";
import S2ltype from "S2ltype";
import { Expr } from "Expr";
import { AssignExpr } from "Expr";
import { BinaryExpr } from "Expr";
import { CallExpr } from "Expr";
import { GetExpr } from "Expr";
import { GroupingExpr } from "Expr";
import { LiteralExpr } from "Expr";
import { SetExpr } from "Expr";
import { SuperExpr } from "Expr";
import { ThisExpr } from "Expr";
import { LogicalExpr } from "Expr";
import { UnaryExpr } from "Expr";
import { VariableExpr } from "Expr";

export interface Stmt{
  accept<T>(visitor: StmtVisitor<T>): T
}

export interface StmtVisitor <T>{
  visitNoopStmt(stmt: NoopStmt): T;
  visitImportStmt(stmt: ImportStmt): T;
  visitBlockStmt(stmt: BlockStmt): T;
  visitClassStmt(stmt: ClassStmt): T;
  visitExpressionStmt(stmt: ExpressionStmt): T;
  visitFunctionStmt(stmt: FunctionStmt): T;
  visitIfStmt(stmt: IfStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
  visitReturnStmt(stmt: ReturnStmt): T;
  visitVarStmt(stmt: VarStmt): T;
  visitWhileStmt(stmt: WhileStmt): T;
}

export class NoopStmt implements Stmt{
  constructor () {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitNoopStmt(this);
  }
}

export class ImportStmt implements Stmt{
  constructor(
    public name: Token,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitImportStmt(this);
  }
}

export class BlockStmt implements Stmt{
  constructor(
    public statements: Stmt[],
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitBlockStmt(this);
  }
}

export class ClassStmt implements Stmt{
  constructor(
    public name: Token,
    public superClass: VariableExpr|null,
    public methods: FunctionStmt[],
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitClassStmt(this);
  }
}

export class ExpressionStmt implements Stmt{
  constructor(
    public expression: Expr,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitExpressionStmt(this);
  }
}

export class FunctionStmt implements Stmt{
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[],
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitFunctionStmt(this);
  }
}

export class IfStmt implements Stmt{
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt|null,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitIfStmt(this);
  }
}

export class PrintStmt implements Stmt{
  constructor(
    public expression: Expr,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitPrintStmt(this);
  }
}

export class ReturnStmt implements Stmt{
  constructor(
    public keyword: Token,
    public value: Expr|null,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitReturnStmt(this);
  }
}

export class VarStmt implements Stmt{
  constructor(
    public name: Token,
    public initializer: Expr|null,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitVarStmt(this);
  }
}

export class WhileStmt implements Stmt{
  constructor(
    public condition: Expr,
    public body: Stmt,
  ) {}

  accept <T>(visitor: StmtVisitor<T>): T{
    return visitor.visitWhileStmt(this);
  }
}

