import { CreateAccountInput } from "@src/routes/accounts/schema";
import { BaseService } from "../baseService";
import bcrypt from "bcryptjs";
import { Details, UserAgent } from "express-useragent";
import { UnauthenticatedError } from "@src/utils/app_error";
import { signToken } from "@src/utils/jwt";

export class AccountService extends BaseService {
  public async findById(id: string) {
    return this.database.models.Account.findById(id);
  }

  public async createAccount(input: CreateAccountInput, userAgent?: Details) {
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const account = await this.database.models.Account.insertOne({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const session = await this.database.models.Session.insertOne({
      accountId: account.id,
      isValid: true,
      userAgent: userAgent ? JSON.stringify(userAgent) : null,
    });

    const token = signToken({
      accountId: account.id,
      sessionId: session.id,
    });

    return {
      account,
      session,
      token,
    };
  }

  public async login(input: { email: string; password: string }, userAgent?: Details) {
    const account = await this.database.models.Account.findOne({
      email: input.email,
    });
    if (!account) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(input.password, account.password);
    if (!isPasswordValid) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const session = await this.database.models.Session.insertOne({
      accountId: account.id,
      isValid: true,
      userAgent: userAgent ? JSON.stringify(userAgent) : null,
    });

    const token = signToken({
      accountId: account.id,
      sessionId: session.id,
    });

    return {
      account,
      session,
      token,
    };
  }

  public async logout(sessionId: string) {
    await this.database.models.Session.updateOne({ id: sessionId }, { isValid: false });
  }

  public async getProfileAuthorizations(accountId: string) {
    const authorizations = await this.database.models.ProfileAuthorization.getProfileAuthorizations(accountId);
    return authorizations;
  }
}
