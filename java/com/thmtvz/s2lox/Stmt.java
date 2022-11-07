package com.thmtvz.s2lox;

import java.util.List;
import java.util.ArrayList;

abstract class Stmt {
  interface Visitor<T> {
    T visitBlockStmt(Block Stmt);
    T visitClassStmt(Class Stmt);
    T visitExpressionStmt(Expression Stmt);
    T visitFunctionStmt(Function Stmt);
    T visitIfStmt(If Stmt);
    T visitPrintStmt(Print Stmt);
    T visitReturnStmt(Return Stmt);
    T visitVarStmt(Var Stmt);
    T visitWhileStmt(While Stmt);
  }

  abstract public String toString();

  static class Block extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitBlockStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.statements);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Block(List<Stmt> statements){
      this.statements = statements;
    }

    final List<Stmt> statements;
  }

  static class Class extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitClassStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.name);
      props.add(this.superClass);
      props.add(this.methods);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Class(Token name, Expr.Variable superClass, List<Stmt.Function> methods){
      this.name = name;
      this.superClass = superClass;
      this.methods = methods;
    }

    final Token name;
    final Expr.Variable superClass;
    final List<Stmt.Function> methods;
  }

  static class Expression extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitExpressionStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.expression);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Expression(Expr expression){
      this.expression = expression;
    }

    final Expr expression;
  }

  static class Function extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitFunctionStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.name);
      props.add(this.params);
      props.add(this.body);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Function(Token name, List<Token> params, List<Stmt> body){
      this.name = name;
      this.params = params;
      this.body = body;
    }

    final Token name;
    final List<Token> params;
    final List<Stmt> body;
  }

  static class If extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitIfStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.condition);
      props.add(this.thenBranch);
      props.add(this.elseBranch);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    If(Expr condition, Stmt thenBranch, Stmt elseBranch){
      this.condition = condition;
      this.thenBranch = thenBranch;
      this.elseBranch = elseBranch;
    }

    final Expr condition;
    final Stmt thenBranch;
    final Stmt elseBranch;
  }

  static class Print extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitPrintStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.expression);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Print(Expr expression){
      this.expression = expression;
    }

    final Expr expression;
  }

  static class Return extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitReturnStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.keyword);
      props.add(this.value);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Return(Token keyword, Expr value){
      this.keyword = keyword;
      this.value = value;
    }

    final Token keyword;
    final Expr value;
  }

  static class Var extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitVarStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.name);
      props.add(this.initializer);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Var(Token name, Expr initializer){
      this.name = name;
      this.initializer = initializer;
    }

    final Token name;
    final Expr initializer;
  }

  static class While extends Stmt {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitWhileStmt(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.condition);
      props.add(this.body);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Stmt.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    While(Expr condition, Stmt body){
      this.condition = condition;
      this.body = body;
    }

    final Expr condition;
    final Stmt body;
  }

  abstract <T> T accept(Visitor<T> visitor);
  public static <T> String listToString(List<T> list){ 
      StringBuilder builder = new StringBuilder(); 
      for(T element : list){ 
  	builder.append(element.toString()); 
      } 
      return builder.toString(); 
  } 
}
