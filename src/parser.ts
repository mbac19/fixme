import {
  BinaryOperator,
  FunctionOperator,
  Operator,
  OperatorType,
  UnaryOperator,
} from "./operator";
import { CloseSymbol, OperatorProcessor } from "./operator_processor";
import { CoreOperators } from "./core_operators";
import { DefaultParserDef, ParserDef } from "./parser_def";
import {
  getLiteralClaimToken,
  getOperatorClaimToken,
  getVariableClaimToken,
  getWhitespaceClaimToken,
} from "./get_claim_token";
import { MathASTNode } from "./math_ast";
import { MathSyntaxError } from "./error_utils";

export class Parser {
  private readonly def: ParserDef;

  private readonly unaryOperators: Array<UnaryOperator>;

  private readonly binaryOperators: Array<BinaryOperator>;

  private readonly functionOperators: Array<FunctionOperator>;

  static parse(text: string): MathASTNode {
    return new Parser().parse(text);
  }

  constructor(def: Partial<ParserDef> = DefaultParserDef) {
    this.def = { ...DefaultParserDef, ...def };

    const binaryOperators: Array<BinaryOperator> = [];
    const unaryOperators: Array<UnaryOperator> = [];
    const functionOperators: Array<FunctionOperator> = [];

    for (const operator of Object.values(CoreOperators)) {
      switch (operator.type) {
        case OperatorType.Binary:
          binaryOperators.push(operator);
          break;

        case OperatorType.Unary:
          // NOTE: We are treating the unary minus as a special case and not
          // processing it with the other unary operators. This is because
          // it must be disambiguated from the binary minus.
          if (operator !== CoreOperators.unaryMinus) {
            unaryOperators.push(operator);
          }
          break;

        case OperatorType.Function:
          functionOperators.push(operator);
          break;
      }
    }

    this.binaryOperators = binaryOperators;
    this.unaryOperators = unaryOperators;
    this.functionOperators = functionOperators;
  }

  public addOperator(operator: Operator) {
    switch (operator.type) {
      case OperatorType.Function:
        this.functionOperators.push(operator);
        break;

      case OperatorType.Binary:
        this.binaryOperators.push(operator);
        break;

      case OperatorType.Unary:
        this.unaryOperators.push(operator);
        break;
    }
  }

  public parse(text: string): MathASTNode {
    const processor = new OperatorProcessor(this.def);

    let pointer = 0;

    // If we are processing a function, then we need to count the number
    // of operands we are expecting for that function.
    while (pointer < text.length) {
      const whitspaceClaim = getWhitespaceClaimToken(text, pointer);
      if (whitspaceClaim !== undefined) {
        pointer = whitspaceClaim.end;
        continue;
      }

      processor.startPass();

      // Check if we found a number literal.
      const literalClaimToken = getLiteralClaimToken(text, pointer);

      if (literalClaimToken !== undefined) {
        // Encountered a literal.
        // TODO: Would like to eventually support other number formats, such
        // as scientific notation.
        const literal = parseFloat(
          text.slice(literalClaimToken.start, literalClaimToken.end)
        );

        processor.addLiteral(
          literal,
          literalClaimToken.start,
          literalClaimToken.end
        );

        pointer = literalClaimToken.end;

        continue;
      }

      if (text.charAt(pointer) === "(") {
        processor.addOpenParens(pointer, pointer + 1);
        pointer += 1;
        continue;
      }

      // Check if this is a end parenthesis or comma
      if (text.charAt(pointer) === ")" || text.charAt(pointer) === "💣") {
        const closeSymbol = text.charAt(pointer) as CloseSymbol;
        processor.addCloseSymbol(closeSymbol, pointer, pointer + 1);
        pointer += 1;
        continue;
      }

      // Check if this is a unary operator.
      let isUnaryOperator = false;

      for (const operator of this.unaryOperators) {
        const claimToken = getOperatorClaimToken(operator, text, pointer);

        if (claimToken !== undefined) {
          isUnaryOperator = true;
          processor.addOperator(operator, claimToken.start, claimToken.end);
          pointer = claimToken.end;
          break; // break out of the inner for loop
        }
      }

      if (isUnaryOperator) {
        continue;
      }

      // Check for the unary minus operator.
      const unaryMinusClaimToken = getOperatorClaimToken(
        CoreOperators.unaryMinus,
        text,
        pointer
      );

      if (
        unaryMinusClaimToken !== undefined &&
        processor.shouldProcessMinusAsUnary()
      ) {
        processor.addOperator(
          CoreOperators.unaryMinus,
          unaryMinusClaimToken.start,
          unaryMinusClaimToken.end
        );
        pointer = unaryMinusClaimToken.end;
        continue;
      }

      // Check if this is a binary operator.
      let isBinaryOperator = false;

      for (const operator of this.binaryOperators) {
        const claimToken = getOperatorClaimToken(operator, text, pointer);

        if (claimToken !== undefined) {
          isBinaryOperator = true;
          processor.addOperator(operator, claimToken.start, claimToken.end);
          pointer = claimToken.end;
          break; // break out of inner for loop.
        }
      }

      if (isBinaryOperator) {
        continue;
      }

      // Check if this is a function operator
      let isFunctionOperator = false;

      for (const operator of this.functionOperators) {
        const claimToken = getOperatorClaimToken(operator, text, pointer);

        if (claimToken !== undefined) {
          isFunctionOperator = true;
          processor.addOperator(operator, claimToken.start, claimToken.end);

          if (text.charAt(claimToken.end) !== "(") {
            throw new MathSyntaxError("Expected '(' after function operator");
          }

          pointer = claimToken.end + 1;
          break; // break out of inner for loop
        }
      }

      if (isFunctionOperator) {
        continue;
      }

      // Check if this is a variable.
      const variableClaimToken = getVariableClaimToken(
        this.def.validVariables,
        text,
        pointer
      );

      if (variableClaimToken !== undefined) {
        const variable = text.slice(
          variableClaimToken.start,
          variableClaimToken.end
        );

        processor.addVariable(
          variable,
          variableClaimToken.start,
          variableClaimToken.end
        );

        pointer = variableClaimToken.end;

        continue;
      }

      throw new MathSyntaxError(`Unexpected token: ${text.charAt(pointer)}`);
    }

    return processor.done();
  }
}
