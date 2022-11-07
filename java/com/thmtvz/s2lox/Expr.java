package com.thmtvz.s2lox;

import java.util.List;
import java.util.ArrayList;

abstract class Expr {
  interface Visitor<T> {
    T visitAssignExpr(Assign Expr);
    T visitBinaryExpr(Binary Expr);
    T visitCallExpr(Call Expr);
    T visitGetExpr(Get Expr);
    T visitGroupingExpr(Grouping Expr);
    T visitLiteralExpr(Literal Expr);
    T visitSetExpr(Set Expr);
    T visitSuperExpr(Super Expr);
    T visitThisExpr(This Expr);
    T visitLogicalExpr(Logical Expr);
    T visitUnaryExpr(Unary Expr);
    T visitVariableExpr(Variable Expr);
  }

  abstract public String toString();

  static class Assign extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitAssignExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.name);
      props.add(this.value);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Assign(Token name, Expr value){
      this.name = name;
      this.value = value;
    }

    final Token name;
    final Expr value;
  }

  static class Binary extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitBinaryExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.left);
      props.add(this.operator);
      props.add(this.right);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Binary(Expr left, Token operator, Expr right){
      this.left = left;
      this.operator = operator;
      this.right = right;
    }

    final Expr left;
    final Token operator;
    final Expr right;
  }

  static class Call extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitCallExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.callee);
      props.add(this.paren);
      props.add(this.arguments);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Call(Expr callee, Token paren, List<Expr> arguments){
      this.callee = callee;
      this.paren = paren;
      this.arguments = arguments;
    }

    final Expr callee;
    final Token paren;
    final List<Expr> arguments;
  }

  static class Get extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitGetExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.object);
      props.add(this.name);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Get(Expr object, Token name){
      this.object = object;
      this.name = name;
    }

    final Expr object;
    final Token name;
  }

  static class Grouping extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitGroupingExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.expression);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Grouping(Expr expression){
      this.expression = expression;
    }

    final Expr expression;
  }

  static class Literal extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitLiteralExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.value);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Literal(Object value){
      this.value = value;
    }

    final Object value;
  }

  static class Set extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitSetExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.object);
      props.add(this.name);
      props.add(this.value);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Set(Expr object, Token name, Expr value){
      this.object = object;
      this.name = name;
      this.value = value;
    }

    final Expr object;
    final Token name;
    final Expr value;
  }

  static class Super extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitSuperExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.keyword);
      props.add(this.method);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Super(Token keyword, Token method){
      this.keyword = keyword;
      this.method = method;
    }

    final Token keyword;
    final Token method;
  }

  static class This extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitThisExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.keyword);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    This(Token keyword){
      this.keyword = keyword;
    }

    final Token keyword;
  }

  static class Logical extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitLogicalExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.left);
      props.add(this.operator);
      props.add(this.right);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Logical(Expr left, Token operator, Expr right){
      this.left = left;
      this.operator = operator;
      this.right = right;
    }

    final Expr left;
    final Token operator;
    final Expr right;
  }

  static class Unary extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitUnaryExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.operator);
      props.add(this.right);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Unary(Token operator, Expr right){
      this.operator = operator;
      this.right = right;
    }

    final Token operator;
    final Expr right;
  }

  static class Variable extends Expr {
    @Override
    <T> T accept(Visitor<T> visitor){
      return visitor.visitVariableExpr(this);
    }

    @Override
    public String toString(){
      List<Object> props = new ArrayList<>();
      StringBuilder builder = new StringBuilder(); 

      props.add(this.name);

      for(Object o : props){
          if(o == null) continue;
          if(o instanceof List){
            builder.append(Expr.listToString((List)o));
            continue;
          }
          builder.append(o.toString());
      }
      return builder.toString();
    }

    Variable(Token name){
      this.name = name;
    }

    final Token name;
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
