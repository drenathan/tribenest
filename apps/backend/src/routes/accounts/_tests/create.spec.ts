import { createTestApp } from "@src/_tests/init";

describe("POST /accounts", () => {
  test("should create an account", async () => {
    const testApp = await createTestApp();
    const data = await testApp.post("/accounts").send({
      name: "test",
    });
  });
});
