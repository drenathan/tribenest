import BaseModel from "../baseModel";
import { testDatabase } from "@src/_tests/init";
import { DB } from "@src/db/types";

describe("BaseModel", () => {
  let AccountModel: BaseModel<"accounts", "id", DB["accounts"], string>;

  beforeEach(async () => {
    AccountModel = new BaseModel(testDatabase.client, "accounts", "id");
    await AccountModel.deleteMany();
  });

  afterEach(async () => {
    await AccountModel.deleteMany();
  });

  describe("insertMany", () => {
    it("should insert multiple records into the database", async () => {
      await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);
      const accounts = await AccountModel.find();
      expect(accounts).toHaveLength(2);
      expect(accounts[0].email).toBe("test1@email.com");
      expect(accounts[1].email).toBe("test2@gmail.com");
      expect(accounts[0].id).toBeDefined();
    });
  });

  describe("find", () => {
    it("should work with query builder function", async () => {
      await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);
      const accounts = await AccountModel.find(undefined, (qb) => {
        return qb.where("email", "=", "test1@email.com");
      });
      expect(accounts).toHaveLength(1);
      expect(accounts[0].email).toBe("test1@email.com");
    });
  });

  describe("findOne", () => {
    it("should find one based on the field", async () => {
      await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);
      let account = await AccountModel.findOne({ email: "test1@email.com" });
      expect(account).toBeDefined();
      expect(account?.email).toBe("test1@email.com");

      account = await AccountModel.findOne({ password: "password2" });
      expect(account).toBeDefined();
      expect(account?.password).toBe("password2");
    });
  });

  describe("findById", () => {
    it("should find one based id", async () => {
      const accounts = await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);
      const account = await AccountModel.findById(accounts[0].id);
      expect(account).toBeDefined();
      expect(account?.email).toBe("test1@email.com");
    });
  });

  describe("deleteOne", () => {
    it("should delete one", async () => {
      const accounts = await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);

      await AccountModel.deleteOne({ id: accounts[0].id });
      const account = await AccountModel.findById(accounts[0].id);
      expect(account).toBeUndefined();
    });
  });

  describe("findByIdAndDelete", () => {
    it("should delete one by id", async () => {
      const accounts = await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);

      await AccountModel.findByIdAndDelete(accounts[0].id);
      const account = await AccountModel.findById(accounts[0].id);
      expect(account).toBeUndefined();
    });
  });

  describe("deleteMany", () => {
    it("should delete one by id", async () => {
      await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
        { email: "test2@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
        { email: "test3@gmail.com", password: "password2", firstName: "Jane", lastName: "Doe" },
      ]);

      await AccountModel.deleteMany({ password: "password2" });
      const account = await AccountModel.find();
      expect(account).toHaveLength(1);
      expect(account[0].password).toBe("password1");
    });
  });

  describe("updateOne", () => {
    it("should update one", async () => {
      const accounts = await AccountModel.insertMany([
        { email: "test1@email.com", password: "password1", firstName: "John", lastName: "Doe" },
      ]);

      await AccountModel.updateOne({ id: accounts[0].id }, { firstName: "Jane" });
      const account = await AccountModel.findById(accounts[0].id);
      expect(account).toBeDefined();
      expect(account?.firstName).toBe("Jane");
    });
  });
});
