import { Operator, OperatorPrecedence, OperatorType } from "./operator";

export const CoreOperators: Record<string, Operator> = {
  cosin: {
    type: OperatorType.Function,
    arity: 1,
    name: "Cosine",
    symbol: "cosin",
  },

  diff: {
    type: OperatorType.Binary,
    precedence: OperatorPrecedence.Normal,
    name: "Difference",
    symbol: "-",
  },

  exp: {
    type: OperatorType.Binary,
    precedence: OperatorPrecedence.High,
    name: "Exponent",
    symbol: "^",
  },

  log: {
    type: OperatorType.Function,
    arity: 1,
    name: "Log10",
    symbol: "log",
  },

  prod: {
    type: OperatorType.Binary,
    precedence: OperatorPrecedence.Medium,
    name: "Product",
    symbol: "*",
  },

  quot: {
    type: OperatorType.Binary,
    name: "Quotient",
    symbol: "/",
    precedence: OperatorPrecedence.Medium,
  },

  sin: {
    type: OperatorType.Function,
    arity: 1,
    name: "Sine",
    symbol: "sin",
  },

  sum: {
    type: OperatorType.Binary,
    precedence: OperatorPrecedence.Normal,
    name: "Sum",
    symbol: "+",
  },

  tan: {
    type: OperatorType.Function,
    arity: 1,
    name: "Tangent",
    symbol: "tan",
  },

  unaryMinus: {
    type: OperatorType.Unary,
    name: "Minus",
    symbol: "_",
  },
};
