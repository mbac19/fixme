import { Eval } from "./eval";

describe("eval", () => {
  test("not yet implemented", () => {
    expect(() => Eval.eval("x + 1", { x: 2 })).toThrow();
  });
});
