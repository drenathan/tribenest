import { CreateAccountInput } from "@src/routes/accounts/schema";
import { BaseService } from "../baseService";
import bcrypt from "bcryptjs";
import { Details, UserAgent } from "express-useragent";
import { BadRequestError, NotFoundError, UnauthenticatedError } from "@src/utils/app_error";
import { signToken } from "@src/utils/jwt";
import { UpdatePublicAccountInput, UpdatePublicAccountPasswordInput } from "@src/routes/public/accounts/schema";
import { MULTI_TENANT } from "@src/configuration/secrets";

export class AccountService extends BaseService {
  public async findById(id: string) {
    const account = await this.database.models.Account.findById(id);

    if (account) {
      account.password = "";
    }
    return account;
  }

  public async createAccount(input: CreateAccountInput, userAgent?: Details) {
    if (!MULTI_TENANT) {
      const profile = await this.database.models.Profile.findOne({
        subdomain: "default-site",
      });

      if (profile) {
        throw new BadRequestError("Account creation is not allowed");
      }
    }

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
      throw new UnauthenticatedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, account.password);
    if (!isPasswordValid) {
      throw new UnauthenticatedError("Invalid email or password");
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

  public async updateAccount(accountId: string, input: UpdatePublicAccountInput) {
    await this.database.models.Account.updateOne(
      { id: accountId },
      { firstName: input.firstName, lastName: input.lastName },
    );
    return true;
  }

  public async updateAccountPassword(accountId: string, input: UpdatePublicAccountPasswordInput) {
    const account = await this.database.models.Account.findOne({ id: accountId });
    if (!account) {
      throw new NotFoundError("Account not found");
    }

    const isPasswordValid = await bcrypt.compare(input.currentPassword, account.password);
    if (!isPasswordValid) {
      throw new UnauthenticatedError("Your current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await this.database.models.Account.updateOne({ id: accountId }, { password: hashedPassword });

    return true;
  }
}
