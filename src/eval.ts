import { MathASTNode } from "./math_ast";
import { Parser } from "./parser";

export type ResolvedSymbols = Record<string, number>;

export const Eval = {
  eval(text: string, symbols?: ResolvedSymbols): number {
    const parsed = Parser.parse(text);
    return Eval.evalNode(parsed, symbols);
  },

  evalNode(operator: MathASTNode, symbols?: ResolvedSymbols): number {
    throw Error("TODO");
  },
};
