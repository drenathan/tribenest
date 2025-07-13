import { Services } from "@src/services";
import { Queue } from "bullmq";
import { EmailClient } from "./EmailClient";
import { AccountWelcomeTemplate } from "./templates/account/welcome";

export const bootstrapEmails = (queue: Queue, services: Services) => {
  const emailClient = new EmailClient();
  return {
    account: {
      welcome: new AccountWelcomeTemplate(queue, services, emailClient),
    },
  };
};
