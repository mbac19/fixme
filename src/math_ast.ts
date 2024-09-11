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

export interface MathASTNodeBase {
  sourceStart: number;
  sourceEnd: number;
}

export interface LiteralMathASTNode extends MathASTNodeBase {
  type: MathASTNodeType.Literal;
  value: Literal;
}

export interface VariableMathASTNode extends MathASTNodeBase {
  type: MathASTNodeType.Variable;
  value: Variable;
}

export interface BinaryOperatorMathASTNode extends MathASTNodeBase {
  type: MathASTNodeType.BinaryOperator;
  operator: BinaryOperator;
  value: [MathASTNode, MathASTNode];
}

export interface UnaryOperatorMathASTNode extends MathASTNodeBase {
  type: MathASTNodeType.UnaryOperator;
  operator: UnaryOperator;
  value: [MathASTNode];
}

export interface FunctionOperatorMathASTNode extends MathASTNodeBase {
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

export function makeLiteralNode(
  value: number,
  sourceStart: number,
  sourceEnd: number
): LiteralMathASTNode {
  return {
    type: MathASTNodeType.Literal,
    value,
    sourceStart: sourceStart,
    sourceEnd: sourceEnd,
  };
}

export function makeVariableNode(
  value: string,
  sourceStart: number,
  sourceEnd: number
): VariableMathASTNode {
  return {
    type: MathASTNodeType.Variable,
    value,
    sourceStart,
    sourceEnd,
  };
}

export function makeOperatorNode(
  operator: Operator,
  value: Array<MathASTNode>,
  sourceStart: number,
  sourceEnd: number
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
        sourceStart,
        sourceEnd,
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
        sourceStart,
        sourceEnd,
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
        sourceStart,
        sourceEnd,
      };
    }
  }
}
