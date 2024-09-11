import { CoreOperators } from "./core_operators";
import {
  makeLiteralNode,
  makeOperatorNode,
  makeVariableNode,
} from "./math_ast";
import { Operator, OperatorType } from "./operator";
import { Parser } from "./parser";

describe("Parser", () => {
  it("parses number literals", () => {
    expect(Parser.parse("2")).toEqual(makeLiteralNode(2, 0, 1));
    expect(Parser.parse("1.12")).toEqual(makeLiteralNode(1.12, 0, 4));
    expect(Parser.parse(".12")).toEqual(makeLiteralNode(0.12, 0, 3));
  });

  it("parses the sum operation", () => {
    expect(Parser.parse("2 + 3")).toEqual(
      makeOperatorNode(
        CoreOperators.sum,
        [makeLiteralNode(2, 0, 1), makeLiteralNode(3, 4, 5)],
        2,
        3
      )
    );
  });

  it("parses the minus operator", () => {
    expect(Parser.parse("2 - 3")).toEqual(
      makeOperatorNode(
        CoreOperators.diff,
        [makeLiteralNode(2, 0, 1), makeLiteralNode(3, 4, 5)],
        2,
        3
      )
    );
  });

  it("parses assuming left associativity", () => {
    expect(Parser.parse("1 + 2 + 3")).toEqual(
      makeOperatorNode(
        CoreOperators.sum,
        [
          makeOperatorNode(
            CoreOperators.sum,
            [makeLiteralNode(1, 0, 1), makeLiteralNode(2, 4, 5)],
            2,
            3
          ),
          makeLiteralNode(3, 8, 9),
        ],
        6,
        7
      )
    );
  });

  it("parses the multiplication operator", () => {
    expect(Parser.parse("2 * 3.1")).toEqual(
      makeOperatorNode(
        CoreOperators.prod,
        [makeLiteralNode(2, 0, 1), makeLiteralNode(3.1, 4, 7)],
        2,
        3
      )
    );
  });

  it("parses the division operator", () => {
    expect(Parser.parse(".12 / .48")).toEqual(
      makeOperatorNode(
        CoreOperators.quot,
        [makeLiteralNode(0.12, 0, 3), makeLiteralNode(0.48, 6, 9)],
        4,
        5
      )
    );
  });

  it("parses the exponent operator", () => {
    expect(Parser.parse("1.1 ^ 3")).toEqual(
      makeOperatorNode(
        CoreOperators.exp,
        [makeLiteralNode(1.1, 0, 3), makeLiteralNode(3, 6, 7)],
        4,
        5
      )
    );
  });

  it("gives multiplication higher precedence than addition", () => {
    expect(Parser.parse("1 * 2 + 3")).toEqual(
      makeOperatorNode(
        CoreOperators.sum,
        [
          makeOperatorNode(
            CoreOperators.prod,
            [makeLiteralNode(1, 0, 1), makeLiteralNode(2, 4, 5)],
            2,
            3
          ),
          makeLiteralNode(3, 8, 9),
        ],
        6,
        7
      )
    );
  });

  it("gives exponent higher precedence than multiplication", () => {
    expect(Parser.parse("1 + 2 ^ 3")).toEqual(
      makeOperatorNode(
        CoreOperators.sum,
        [
          makeLiteralNode(1, 0, 1),
          makeOperatorNode(
            CoreOperators.exp,
            [makeLiteralNode(2, 4, 5), makeLiteralNode(3, 8, 9)],
            6,
            7
          ),
        ],
        2,
        3
      )
    );
  });

  it("parses variables", () => {
    expect(Parser.parse("x")).toEqual(makeVariableNode("x", 0, 1));

    expect(Parser.parse("1 + x")).toEqual(
      makeOperatorNode(
        CoreOperators.sum,
        [makeLiteralNode(1, 0, 1), makeVariableNode("x", 4, 5)],
        2,
        3
      )
    );
  });

  it("parses parenthesis", () => {
    expect(Parser.parse("(1)")).toEqual(makeLiteralNode(1, 1, 2));
    expect(Parser.parse("((1))")).toEqual(makeLiteralNode(1, 2, 3));
  });

  it("sets precedence on operations within parenthesis", () => {
    expect(Parser.parse("(1 + 2) * 3")).toEqual(
      makeOperatorNode(
        CoreOperators.prod,
        [
          makeOperatorNode(
            CoreOperators.sum,
            [makeLiteralNode(1, 1, 2), makeLiteralNode(2, 5, 6)],
            3,
            4
          ),
          makeLiteralNode(3, 10, 11),
        ],
        8,
        9
      )
    );
  });

  it("throws an error when a binary operation is used incorrectly", () => {
    expect(() => Parser.parse("1 *")).toThrow();
  });

  it("parses the log operator", () => {
    expect(Parser.parse("log(1)")).toEqual(
      makeOperatorNode(CoreOperators.log, [makeLiteralNode(1, 4, 5)], 0, 3)
    );
  });

  it("parses the sin operator", () => {
    expect(Parser.parse("sin(0)")).toEqual(
      makeOperatorNode(CoreOperators.sin, [makeLiteralNode(0, 4, 5)], 0, 3)
    );
  });

  it("parses the cosin operator", () => {
    expect(Parser.parse("cosin(0)")).toEqual(
      makeOperatorNode(CoreOperators.cosin, [makeLiteralNode(0, 6, 7)], 0, 5)
    );
  });

  it("parses the tan operator", () => {
    expect(Parser.parse("tan(1)")).toEqual(
      makeOperatorNode(CoreOperators.tan, [makeLiteralNode(1, 4, 5)], 0, 3)
    );
  });

  it("configures to only allow certain variables", () => {
    const parser = new Parser({ validVariables: ["x", "y"] });
    expect(() => parser.parse("tan(x + y)")).not.toThrow();
    expect(() => parser.parse("tan(x + z)")).toThrow();
  });

  describe("implicit multiply", () => {
    it("works between variable and literal", () => {
      expect(Parser.parse("3x")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [makeLiteralNode(3, 0, 1), makeVariableNode("x", 1, 2)],
          1,
          1
        )
      );

      expect(Parser.parse("x3")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [makeVariableNode("x", 0, 1), makeLiteralNode(3, 1, 2)],
          1,
          1
        )
      );
    });

    it("works between variable and variable", () => {
      expect(Parser.parse("xy")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [makeVariableNode("x", 0, 1), makeVariableNode("y", 1, 2)],
          1,
          1
        )
      );
    });

    it("works between complex operations", () => {
      expect(Parser.parse("x^2y^2")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [
            makeOperatorNode(
              CoreOperators.exp,
              [makeVariableNode("x", 0, 1), makeLiteralNode(2, 2, 3)],
              1,
              2
            ),
            makeOperatorNode(
              CoreOperators.exp,
              [makeVariableNode("y", 3, 4), makeLiteralNode(2, 5, 6)],
              4,
              5
            ),
          ],
          3,
          3
        )
      );
    });

    it("works with parenthesis", () => {
      expect(Parser.parse("(1)(2)")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [makeLiteralNode(1, 1, 2), makeLiteralNode(2, 4, 5)],
          3,
          3
        )
      );

      expect(Parser.parse("1(2)")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [makeLiteralNode(1, 0, 1), makeLiteralNode(2, 2, 3)],
          1,
          1
        )
      );

      expect(Parser.parse("(1)2")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [makeLiteralNode(1, 1, 2), makeLiteralNode(2, 3, 4)],
          3,
          3
        )
      );
    });

    it("works with function operators", () => {
      expect(Parser.parse("xsin(y)")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [
            makeVariableNode("x", 0, 1),
            makeOperatorNode(
              CoreOperators.sin,
              [makeVariableNode("y", 5, 6)],
              1,
              4
            ),
          ],
          1,
          1
        )
      );
    });
  });

  it("configures to disable implicit multiply", () => {
    const parser = new Parser({ implicitMultiply: false });
    expect(() => parser.parse("xy")).toThrow();
  });

  it("configures to calculate with right associativity", () => {
    const parser = new Parser({ isLeftAssociative: false });

    expect(parser.parse("1 + 2 + 3")).toEqual(
      makeOperatorNode(
        CoreOperators.sum,
        [
          makeLiteralNode(1, 0, 1),
          makeOperatorNode(
            CoreOperators.sum,
            [makeLiteralNode(2, 4, 5), makeLiteralNode(3, 8, 9)],
            6,
            7
          ),
        ],
        2,
        3
      )
    );
  });

  it("supports custom unary operators", () => {
    const parser = new Parser();
    const $: Operator = {
      type: OperatorType.Unary,
      name: "Blah",
      symbol: "$",
    };

    parser.addOperator($);

    expect(parser.parse("$1")).toEqual(
      makeOperatorNode($, [makeLiteralNode(1, 1, 2)], 0, 1)
    );
  });

  describe("Function Operators", () => {
    it("works with function operators containing multiple params", () => {
      const parser = new Parser();

      const max: Operator = {
        arity: 2,
        type: OperatorType.Function,
        name: "Max",
        symbol: "max",
      };

      parser.addOperator(max);

      expect(parser.parse("max(1,2)")).toEqual(
        makeOperatorNode(
          max,
          [makeLiteralNode(1, 4, 5), makeLiteralNode(2, 6, 7)],
          0,
          3
        )
      );
    });
  });

  describe("Unary Operators", () => {
    it("parses with parenthesis", () => {
      const $: Operator = {
        type: OperatorType.Unary,
        name: "Blah",
        symbol: "$",
      };

      const parser = new Parser();

      parser.addOperator($);

      expect(parser.parse("$(1)")).toEqual(
        makeOperatorNode($, [makeLiteralNode(1, 2, 3)], 0, 1)
      );

      expect(parser.parse("($1)")).toEqual(
        makeOperatorNode($, [makeLiteralNode(1, 2, 3)], 1, 2)
      );
    });

    it("parses with highest precedence with binary operators", () => {
      const parser = new Parser();

      const $: Operator = {
        type: OperatorType.Unary,
        name: "Blah",
        symbol: "$",
      };

      parser.addOperator($);

      expect(parser.parse("$1 + 2")).toEqual(
        makeOperatorNode(
          CoreOperators.sum,
          [
            makeOperatorNode($, [makeLiteralNode(1, 1, 2)], 0, 1),
            makeLiteralNode(2, 5, 6),
          ],
          3,
          4
        )
      );

      expect(parser.parse("1 + $2")).toEqual(
        makeOperatorNode(
          CoreOperators.sum,
          [
            makeLiteralNode(1, 0, 1),
            makeOperatorNode($, [makeLiteralNode(2, 5, 6)], 4, 5),
          ],
          2,
          3
        )
      );

      expect(parser.parse("$1 + 2 * 3")).toEqual(
        makeOperatorNode(
          CoreOperators.sum,
          [
            makeOperatorNode($, [makeLiteralNode(1, 1, 2)], 0, 1),
            makeOperatorNode(
              CoreOperators.prod,
              [makeLiteralNode(2, 5, 6), makeLiteralNode(3, 9, 10)],
              7,
              8
            ),
          ],
          3,
          4
        )
      );
    });

    it("parses with more complicated math statements nested inside", () => {
      const parser = new Parser();

      const $: Operator = {
        type: OperatorType.Unary,
        name: "Blah",
        symbol: "$",
      };

      parser.addOperator($);

      expect(parser.parse("$(1 + 2sin(x))")).toEqual(
        makeOperatorNode(
          $,
          [
            makeOperatorNode(
              CoreOperators.sum,
              [
                makeLiteralNode(1, 2, 3),
                makeOperatorNode(
                  CoreOperators.prod,
                  [
                    makeLiteralNode(2, 6, 7),
                    makeOperatorNode(
                      CoreOperators.sin,
                      [makeVariableNode("x", 11, 12)],
                      7,
                      10
                    ),
                  ],
                  7,
                  7
                ),
              ],
              4,
              5
            ),
          ],
          0,
          1
        )
      );
    });

    it("parses with implicit multiplication", () => {
      const parser = new Parser();

      const $: Operator = {
        type: OperatorType.Unary,
        name: "Blah",
        symbol: "$",
      };

      parser.addOperator($);

      expect(parser.parse("2$1")).toEqual(
        makeOperatorNode(
          CoreOperators.prod,
          [
            makeLiteralNode(2, 0, 1),
            makeOperatorNode($, [makeLiteralNode(1, 2, 3)], 1, 2),
          ],
          1,
          1
        )
      );
    });
  });

  it("parses the unary minus operator", () => {
    expect(Parser.parse("-3")).toEqual(
      makeOperatorNode(
        CoreOperators.unaryMinus,
        [makeLiteralNode(3, 1, 2)],
        0,
        1
      )
    );
  });

  it("parses the unary minus operator with parenthesis", () => {
    expect(Parser.parse("(-3)")).toEqual(
      makeOperatorNode(
        CoreOperators.unaryMinus,
        [makeLiteralNode(3, 2, 3)],
        1,
        2
      )
    );

    expect(Parser.parse("-(4)")).toEqual(
      makeOperatorNode(
        CoreOperators.unaryMinus,
        [makeLiteralNode(4, 2, 3)],
        0,
        1
      )
    );
  });

  it("parses the unary minus operator adjacent to binary operators", () => {
    expect(Parser.parse("4 - -3")).toEqual(
      makeOperatorNode(
        CoreOperators.diff,
        [
          makeLiteralNode(4, 0, 1),
          makeOperatorNode(
            CoreOperators.unaryMinus,
            [makeLiteralNode(3, 5, 6)],
            4,
            5
          ),
        ],
        2,
        3
      )
    );
  });

  it("parses consecutive unary minus operators", () => {
    expect(Parser.parse("--12")).toEqual(
      makeOperatorNode(
        CoreOperators.unaryMinus,
        [
          makeOperatorNode(
            CoreOperators.unaryMinus,
            [makeLiteralNode(12, 2, 4)],
            1,
            2
          ),
        ],
        0,
        1
      )
    );
  });

  it("parses the unary minus operator acting on a function operator", () => {
    expect(Parser.parse("-sin(3.14)")).toEqual(
      makeOperatorNode(
        CoreOperators.unaryMinus,
        [
          makeOperatorNode(
            CoreOperators.sin,
            [makeLiteralNode(3.14, 5, 9)],
            1,
            4
          ),
        ],
        0,
        1
      )
    );
  });
});
