/**
 * Error thrown when we encounter a parenthesis or lack of parenthesis that
 * are unbalanced.
 */
export class BadParensError extends Error {}

/**
 * Error thrown when we encounter a variable in the math equation that is not
 * allowed by the parser configuration.
 */
export class UnknownVariableError extends Error {}

/**
 * Error thrown for invalid math equation syntax.
 */
export class MathSyntaxError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Math syntax error");
  }
}

/**
 * Error thrown for calling math functions with incorrect number of params.
 */
export class IncorrectArityError extends Error {}

export function assert(flag: boolean, msg: string | undefined) {}
