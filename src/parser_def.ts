/**
 * Properties that can be used to configure the math equation parser.
 */
export interface ParserDef {
  /**
   * If true, then we allow implicit multiplication when two operands are
   * adjacent two each other with no operator in between. Default to true.
   */
  implicitMultiply?: boolean;

  /**
   * For binary operators with the same precedence, we need to disambiguate
   * the order of operations. If left associative, then we consider the
   * left-most binary operator to have higher precedence, otherwise the right
   * most binary operator. Default to true.
   */
  isLeftAssociative?: boolean;

  /**
   * A list of variable names that are vaid. If undefined, all variables
   * are considered valid.
   */
  validVariables?: Array<string>;
}

export const DefaultParserDef: ParserDef = {
  validVariables: undefined,
  implicitMultiply: true,
  isLeftAssociative: true,
};
