export enum OperatorType {
  Unary,
  Binary,
  Function,
}

/**
 * When enountering operators (typically infix binary operators), the order
 * that we execute the operators is ambiguous. For example (2 + 3 * 7) has
 * ambiguity as to whether we should add 2 and 3 first, or multiply 3 and 7
 * first. This enum is used to resolve that ambiguity by defining the
 * precedence that we should handle operators.
 *
 * If 2 operators have the same precedence, then we choose the operator that
 * shows up first when reading left to right.
 */
export enum OperatorPrecedence {
  Low,
  Normal,
  Medium,
  High,
}

export const OperatorPrecedenceMap: {
  [k in OperatorPrecedence]: number;
} = {
  [OperatorPrecedence.Low]: 1,
  [OperatorPrecedence.Normal]: 2,
  [OperatorPrecedence.Medium]: 3,
  [OperatorPrecedence.High]: 4,
};

export type Operator = BinaryOperator | UnaryOperator | FunctionOperator;

export interface UnaryOperator {
  type: OperatorType.Unary;
  name: string;
  symbol: string;
}

export interface BinaryOperator {
  type: OperatorType.Binary;
  name: string;
  symbol: string;
  precedence: OperatorPrecedence;
}

export interface FunctionOperator {
  type: OperatorType.Function;
  arity: number;
  name: string;
  symbol: string;
}
