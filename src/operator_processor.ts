import { assert, IncorrectArityError, MathSyntaxError } from "./error_utils";
import {
  BinaryOperator,
  FunctionOperator,
  Operator,
  OperatorPrecedenceMap,
  OperatorType,
  UnaryOperator,
} from "./operator";
import { CoreOperators } from "./core_operators";
import { getArity } from "./get_arity";
import {
  Literal,
  makeLiteralNode,
  makeOperatorNode,
  makeVariableNode,
  MathASTNodeType,
  Variable,
} from "./math_ast";
import { MathASTNode } from "./math_ast";
import { ParserDef } from "./parser_def";

export type CloseSymbol = "," | ")";

export type OpenSymbol = "(";

export type TokenType = MathASTNodeType | OpenSymbol | CloseSymbol;

/**
 * A utility class that helps process adding operators. The processor works by
 * handling one token at a time and managing the state for the entire equation.
 * The parser provides one token per pass to the processor and the processor
 * continues to parse the math equation.
 */
export class OperatorProcessor {
  /**
   * The number of operands that the operator at the top of the stack
   * is expecting.
   */
  private remainingFunctionOperands: number = 0;

  /**
   * We keep track of the type of token on the current pass.
   */
  private typeAddedCurrentPass: TokenType | undefined;

  /**
   * We keep track of the token on the previous pass.
   */
  private typeAddedLastPass: TokenType | undefined;

  /**
   * Done parsing the math equation.
   */
  private isDone: boolean = false;

  /**
   * The stack of nodes that we are processing.
   */
  private nodes: Array<MathASTNode> = [];

  /**
   * The stack of operators that we are processing.
   * This is an array of triples, where the first element in the triple is the
   * operator, the second is the start position of the operator in source,
   * and the third is the end position within the source.
   */
  private operatorStack: Array<
    Operator | CloseSymbol | OpenSymbol | "StartOfFunction"
  > = [];

  constructor(private readonly def: ParserDef) {}

  // ---------------------------------------------------------------------------
  // LIFECYCLE
  // ---------------------------------------------------------------------------

  /**
   * Called by the parser when it is ready to process a new token.
   */
  public startPass() {
    assert(!this.isDone, "Cannot add operator ctors after process is done");
    this.typeAddedLastPass = this.typeAddedCurrentPass;
    this.typeAddedCurrentPass = undefined;
  }

  /**
   * Declare that we are done processing this equation and get the resulting
   * syntax tree, if there are no errors.
   */
  public done(): MathASTNode {
    // Loop through, pop, and resolve any operators still left on the stack.
    while (this.operatorStack.length > 0) {
      const operator = this.operatorStack.pop();

      if (operator === undefined || !isOperator(operator)) {
        throw new MathSyntaxError();
      }

      const arity = getArity(operator);

      const params = this.nodes.splice(-arity, arity);

      if (params.length !== arity) {
        throw new IncorrectArityError();
      }

      this.nodes.push(makeOperatorNode(operator, params));
    }

    if (this.nodes.length !== 1) {
      throw new MathSyntaxError("Invalid equation");
    }

    return this.nodes[0];
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  /**
   * If we encounter a minus sign, we need to decide whether the minus sign
   * represents a binary subtract or a unary negate. The processor holds the
   * state of the current math equation parsing, so if the parser encounters
   * a minus sign, it can query the processor as to whether the minus should
   * be unary or binary.
   */
  public shouldProcessMinusAsUnary() {
    return (
      this.typeAddedLastPass !== MathASTNodeType.Literal &&
      this.typeAddedLastPass !== ")"
    );
  }

  // ---------------------------------------------------------------------------
  // PUBLIC PROCESSORS
  // ---------------------------------------------------------------------------

  public addVariable(
    variable: Variable,
    sourceStart: number,
    sourceEnd: number
  ) {
    this.typeAddedCurrentPass = MathASTNodeType.Variable;
    this.maybeImplicitMultiply(sourceStart);
    this.nodes.push(makeVariableNode(variable));
  }

  public addLiteral(literal: Literal, sourceStart: number, sourceEnd: number) {
    this.typeAddedCurrentPass = MathASTNodeType.Literal;
    this.maybeImplicitMultiply(sourceStart);
    this.nodes.push(makeLiteralNode(literal));
  }

  public addOperator(
    operator: Operator,
    sourceStart: number,
    sourceEnd: number
  ) {
    switch (operator.type) {
      case OperatorType.Unary:
        this.addUnaryOperator(operator, sourceStart, sourceEnd);
        break;

      case OperatorType.Binary:
        this.addBinaryOperator(operator, false, sourceStart, sourceEnd);
        break;

      case OperatorType.Function:
        this.addFunctionOperator(operator, sourceStart, sourceEnd);
        break;
    }
  }

  public addOpenParens(sourceStart: number, sourceEnd: number) {
    this.typeAddedCurrentPass = "(";
    this.maybeImplicitMultiply(sourceStart);
    this.operatorStack.push("(");
  }

  /**
   * The close symbol in the math equation means we've reach the end of some
   * expression (i.e. "," or ")")
   */
  public addCloseSymbol(
    closeSymbol: CloseSymbol,
    sourceStart: number,
    sourceEnd: number
  ) {
    this.typeAddedCurrentPass = closeSymbol;

    this.maybeImplicitMultiply(sourceStart);

    const isComma = closeSymbol === ",";

    if (isComma) {
      this.remainingFunctionOperands -= 1;
    }

    // Continuously pop until reaching the corresponding parenthesis.
    let operator = this.operatorStack.pop();

    while (operator !== undefined && isOperator(operator)) {
      const arity = getArity(operator);

      const params = this.nodes.splice(-arity, arity);

      if (params.length !== arity) {
        throw new IncorrectArityError();
      }

      this.nodes.push(makeOperatorNode(operator, params));

      operator = this.operatorStack.pop();
    }

    if (operator && operator === "StartOfFunction" && !isComma) {
      // We processed everything from the start to the end of the function,
      // need to finish off processing this function call.

      // We encountered 1 more operand in this pass of textToProcess.
      this.remainingFunctionOperands -= 1;

      // StartOfFunction is always preceded by its FunctionOperator
      const functionOperator = this.operatorStack.pop();

      if (
        functionOperator === undefined ||
        !isFunctionOperator(functionOperator)
      ) {
        throw new MathSyntaxError();
      }

      const arity = getArity(functionOperator);

      const params = this.nodes.splice(-arity, arity);

      if (params.length !== arity) {
        throw new IncorrectArityError();
      }

      this.nodes.push(makeOperatorNode(functionOperator, params));
    }
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private addUnaryOperator(
    operator: UnaryOperator,
    sourceStart: number,
    sourceEnd: number
  ) {
    this.typeAddedCurrentPass = MathASTNodeType.UnaryOperator;
    this.maybeImplicitMultiply(sourceStart);
    this.operatorStack.push(operator);
  }

  /**
   * Adds a binary payload and optionally add it silently. A payload added
   * silently will not record the current pass as adding a binary operator.
   * This is used to process implicit multiplication correctly.
   */
  private addBinaryOperator(
    operator: BinaryOperator,
    isSilent: boolean,
    sourceStart: number,
    sourceEnd: number
  ) {
    if (!isSilent) {
      this.typeAddedCurrentPass = MathASTNodeType.BinaryOperator;
    }

    const precedenceValue = getPrecedenceValue(operator);

    // Peek at the last operator on the stack.
    let lastOperator = this.operatorStack[this.operatorStack.length - 1];

    while (
      lastOperator !== undefined &&
      isOperator(lastOperator) &&
      // Left Associative
      ((this.def.isLeftAssociative &&
        getPrecedenceValue(lastOperator) >= precedenceValue) ||
        // Right Associative
        getPrecedenceValue(lastOperator) > precedenceValue)
    ) {
      this.operatorStack.pop();
      const arity = getArity(lastOperator);
      const params = this.nodes.splice(-arity, arity);
      const node = makeOperatorNode(lastOperator, params);

      this.nodes.push(node);

      // Peek at the last operator on the stack.
      lastOperator = this.operatorStack[this.operatorStack.length - 1];
    }

    this.operatorStack.push(operator);
  }

  private addFunctionOperator(
    operator: FunctionOperator,
    sourceStart: number,
    sourceEnd: number
  ) {
    this.typeAddedCurrentPass = MathASTNodeType.FunctionOperator;

    this.maybeImplicitMultiply(sourceStart);

    this.operatorStack.push(operator, "StartOfFunction");

    this.remainingFunctionOperands = getArity(operator);
  }

  private maybeImplicitMultiply(sourceStart: number) {
    const leftTypes: Array<TokenType | undefined> = [
      ")",
      MathASTNodeType.Variable,
      MathASTNodeType.Literal,
    ];

    const rightTypes: Array<TokenType | undefined> = [
      "(",
      MathASTNodeType.UnaryOperator,
      MathASTNodeType.FunctionOperator,
      MathASTNodeType.Literal,
      MathASTNodeType.Variable,
    ];

    if (
      this.def.implicitMultiply &&
      leftTypes.indexOf(this.typeAddedLastPass) >= 0 &&
      rightTypes.indexOf(this.typeAddedCurrentPass) >= 0
    ) {
      this.addBinaryOperator(
        CoreOperators.prod as BinaryOperator,
        true,
        sourceStart,
        sourceStart
      );
    }
  }
}

// -----------------------------------------------------------------------------
// PRIVATE HELPERS
// -----------------------------------------------------------------------------

/**
 * Get the precedence value of the operator payload. This is used to decide
 * which operator should be processed first.
 *
 * NOTE: Do not handle function payloads here because functions get processed
 * immediately after the closing parenthesis, so they will never be compared
 * to other operators.
 */
function getPrecedenceValue(operator: Operator): number {
  switch (operator.type) {
    case OperatorType.Binary:
      return OperatorPrecedenceMap[operator.precedence];

    case OperatorType.Unary:
      // Always process unary operators first
      return Infinity;

    default:
      throw Error(
        `getPrecedenceValue has unhandled operator type: ${operator.type}`
      );
  }
}

function isOperator<T>(val: T | Operator): val is Operator {
  return (
    Boolean(val) &&
    typeof val === "object" &&
    val !== null &&
    "type" in val &&
    Object.values(OperatorType).includes(val.type)
  );
}

function isFunctionOperator(val: unknown | undefined): val is FunctionOperator {
  return (
    val !== null &&
    val !== undefined &&
    typeof val === "object" &&
    "type" in val &&
    // @ts-ignore
    val["type"] === OperatorType.Function
  );
}
