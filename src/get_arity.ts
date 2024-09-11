import { Operator, OperatorType } from "./operator";

export function getArity(operator: Operator): number {
  switch (operator.type) {
    case OperatorType.Unary:
      return 1;

    case OperatorType.Binary:
      return 2;

    case OperatorType.Function:
      return operator.arity;
  }
}
