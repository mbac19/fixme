export enum OperatorType {
  Unary,
  Binary,
  Function,
}

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
