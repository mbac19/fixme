import { Operator } from "./operator";

export type ResolvedSymbols = Record<string, number>;

export const Eval = {
  eval(text: string, symbols?: ResolvedSymbols): number {
    throw Error("TODO");
  },

  evalOperators(operator: Operator, symbols?: ResolvedSymbols): number {
    throw Error("TODO");
  },
};
