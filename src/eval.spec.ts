import { Eval } from "./eval";

describe("eval", () => {
  test.skip("evaluates basic expression with only literals", () => {
    expect(Eval.eval("1 + 1")).toBe(2);
  });

  test.skip("evaluates basic expression with symbols", () => {
    expect(Eval.eval("x + 1", { x: 2 })).toBe(3);
  });
});
