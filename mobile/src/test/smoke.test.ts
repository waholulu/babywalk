import { describeAppReadiness } from "./smoke";

describe("quality command setup", () => {
  it("runs a first unit test", () => {
    expect(describeAppReadiness("SproutScout")).toBe(
      "SproutScout quality checks are ready",
    );
  });
});
