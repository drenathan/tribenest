import React from "react";
import { render } from "@react-email/components";
import { Template } from "./template";
import BaseEmailTemplate, { BaseTemplateArgs } from "@src/workers/emails/BaseEmailTemplate";

export interface IVariables extends BaseTemplateArgs {
  name: string;
  link?: string;
  isCreatedFromInvite: boolean;
}

export class AccountWelcomeTemplate extends BaseEmailTemplate<IVariables> {
  name = "ACCOUNT_WELCOME_EMAIL";
  tags = ["email", this.name];
  retryCount = 3;

  public getSubject(variables: IVariables) {
    return "Welcome to the tribe!";
  }

  public getPreviewVariables(): IVariables {
    return {
      name: "John",
      link: "coumo://couple-invite/accept/123456",
      to: [],
      isCreatedFromInvite: false,
      profileId: "123",
    };
  }

  public async getHtml(variables: IVariables) {
    return render(<Template {...variables} />);
  }
}
