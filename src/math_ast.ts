import {
  BinaryOperator,
  FunctionOperator,
  Operator,
  OperatorType,
  UnaryOperator,
} from "./operator";
import { IncorrectArityError } from "./error_utils";

export type Literal = number;

export type Variable = string;

export enum MathASTNodeType {
  Literal,
  BinaryOperator,
  UnaryOperator,
  FunctionOperator,
  Variable,
}

export interface LiteralMathASTNode {
  type: MathASTNodeType.Literal;
  value: Literal;
}

export interface VariableMathASTNode {
  type: MathASTNodeType.Variable;
  value: Variable;
}

export interface BinaryOperatorMathASTNode {
  type: MathASTNodeType.BinaryOperator;
  operator: BinaryOperator;
  value: [MathASTNode, MathASTNode];
}

export interface UnaryOperatorMathASTNode {
  type: MathASTNodeType.UnaryOperator;
  operator: UnaryOperator;
  value: [MathASTNode];
}

export interface FunctionOperatorMathASTNode {
  type: MathASTNodeType.FunctionOperator;
  operator: FunctionOperator;
  value: Array<MathASTNode>;
}

export type OperatorMathASTNode =
  | BinaryOperatorMathASTNode
  | UnaryOperatorMathASTNode
  | FunctionOperatorMathASTNode;

export type MathASTNode =
  | BinaryOperatorMathASTNode
  | FunctionOperatorMathASTNode
  | LiteralMathASTNode
  | UnaryOperatorMathASTNode
  | VariableMathASTNode;

export function makeLiteralNode(value: number): LiteralMathASTNode {
  return {
    type: MathASTNodeType.Literal,
    value,
  };
}

export function makeVariableNode(value: string): VariableMathASTNode {
  return {
    type: MathASTNodeType.Variable,
    value,
  };
}

export function makeOperatorNode(
  operator: Operator,
  value: Array<MathASTNode>
): OperatorMathASTNode {
  switch (operator.type) {
    case OperatorType.Binary: {
      if (value.length !== 2) {
        throw new IncorrectArityError();
      }

      return {
        type: MathASTNodeType.BinaryOperator,
        operator,
        value: value as [MathASTNode, MathASTNode],
      };
    }

    case OperatorType.Unary: {
      if (value.length !== 1) {
        throw new IncorrectArityError();
      }

      return {
        type: MathASTNodeType.UnaryOperator,
        operator,
        value: value as [MathASTNode],
      };
    }

    case OperatorType.Function: {
      if (value.length !== operator.arity) {
        throw new IncorrectArityError();
      }

      return {
        type: MathASTNodeType.FunctionOperator,
        operator,
        value,
      };
    }
  }
}
