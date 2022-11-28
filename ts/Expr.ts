import Token from "Token";
import S2ltype from "S2ltype";

export interface Expr{
  accept<T>(visitor: ExprVisitor<T>): T
}

export interface ExprVisitor <T>{
  visitAssignExpr(expr: AssignExpr): T;
  visitBinaryExpr(expr: BinaryExpr): T;
  visitCallExpr(expr: CallExpr): T;
  visitGetExpr(expr: GetExpr): T;
  visitGroupingExpr(expr: GroupingExpr): T;
  visitLiteralExpr(expr: LiteralExpr): T;
  visitSetExpr(expr: SetExpr): T;
  visitSuperExpr(expr: SuperExpr): T;
  visitThisExpr(expr: ThisExpr): T;
  visitLogicalExpr(expr: LogicalExpr): T;
  visitUnaryExpr(expr: UnaryExpr): T;
  visitVariableExpr(expr: VariableExpr): T;
}

export class AssignExpr implements Expr{
  constructor(
    public name: Token,
    public value: Expr,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitAssignExpr(this);
  }
}

export class BinaryExpr implements Expr{
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitBinaryExpr(this);
  }
}

export class CallExpr implements Expr{
  constructor(
    public callee: Expr,
    public paren: Token,
    public args: Expr[],
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitCallExpr(this);
  }
}

export class GetExpr implements Expr{
  constructor(
    public obj: Expr,
    public name: Token,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitGetExpr(this);
  }
}

export class GroupingExpr implements Expr{
  constructor(
    public expression: Expr,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitGroupingExpr(this);
  }
}

export class LiteralExpr implements Expr{
  constructor(
    public value: S2ltype,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitLiteralExpr(this);
  }
}

export class SetExpr implements Expr{
  constructor(
    public obj: Expr,
    public name: Token,
    public value: Expr,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitSetExpr(this);
  }
}

export class SuperExpr implements Expr{
  constructor(
    public keyword: Token,
    public method: Token,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitSuperExpr(this);
  }
}

export class ThisExpr implements Expr{
  constructor(
    public keyword: Token,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitThisExpr(this);
  }
}

export class LogicalExpr implements Expr{
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitLogicalExpr(this);
  }
}

export class UnaryExpr implements Expr{
  constructor(
    public operator: Token,
    public right: Expr,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitUnaryExpr(this);
  }
}

export class VariableExpr implements Expr{
  constructor(
    public name: Token,
  ) {}

  accept <T>(visitor: ExprVisitor<T>): T{
    return visitor.visitVariableExpr(this);
  }
}

