import { Operator, OperatorType } from "./operator";

const FloatingPointNumberRegExp = /(^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/;

/**
 * A claim token looks at the entire remainder of the math equation that
 * has not yet been parsed, pulls off a set of characters in the front of
 * the equation that it would like to parse, and parse those tokens into
 * something that can be used to create an AST node.
 */
export interface ClaimToken {
  start: number;
  end: number;
}

/**
 * Attempt to parse a number literal from the front of the math equation.
 * Returns the claim token if we were able to parse a literal,
 * otherwise undefined.
 */
export function getLiteralClaimToken(
  text: string,
  pointer: number
): ClaimToken | undefined {
  const subtext = text.slice(pointer);

  const match = subtext.match(FloatingPointNumberRegExp);

  if (!match) {
    return;
  }

  return { start: pointer, end: pointer + match[0].length };
}

/**
 * Attempt to parse a variable from the front of the math equation. Returns the
 * claim token if we were able to parse a variable, otherwise undefined.
 */
export function getVariableClaimToken(
  validVariables: Array<string> | undefined,
  text: string,
  pointer: number
): ClaimToken | undefined {
  const subtext = text.slice(pointer);

  if (!/^[a-zA-Z]/.test(subtext)) {
    return;
  }

  if (validVariables && validVariables.indexOf(subtext.charAt(0)) < 0) {
    return;
  }

  return { start: pointer, end: pointer + 1 };
}

/**
 * Attempts to parse an operator from the front of the math equation. Returns
 * the claim token if we were able to parse the operator, otherwise undefined.
 */
export function getOperatorClaimToken(
  operator: Operator,
  text: string,
  pointer: number
): ClaimToken | undefined {
  const subtext = text.slice(pointer);

  switch (operator.type) {
    case OperatorType.Unary: {
      const { symbol } = operator;
      if (subtext.startsWith(symbol)) {
        return { start: pointer, end: pointer + symbol.length };
      }
      return;
    }

    case OperatorType.Binary: {
      const { symbol } = operator;
      if (subtext.startsWith(symbol)) {
        return { start: pointer, end: pointer + symbol.length };
      }
      return;
    }

    case OperatorType.Function: {
      const { symbol } = operator;
      if (subtext.startsWith(symbol)) {
        return { start: pointer, end: pointer + symbol.length };
      }
      return;
    }
  }
}

export function getWhitespaceClaimToken(
  text: string,
  pointer: number
): ClaimToken | undefined {
  const subtext = text.slice(pointer);

  const match = subtext.match(/^\s+/);

  if (!match) {
    return;
  }

  return { start: pointer, end: match[0].length + pointer };
}
