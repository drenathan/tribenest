import { logger } from "@src/utils/logger";
import BaseJob from "../../../baseJob";
import { OrderStatus } from "@src/db/types/product";
import { ValidationError } from "@src/utils/app_error";
import { Expression, SqlBool } from "kysely";

type Args = {
  emailId: string;
  cursor?: string;
};

export default class ProcessEmailJob extends BaseJob<Args> {
  name = "PROCESS_EMAIL_JOB";
  tags = ["worker", this.name];
  retryCount = 3;

  async handle({ emailId, cursor }: Args) {
    logger.info({ tags: this.tags }, `Processing email ${emailId}`);

    const email = await this.database.models.Email.findById(emailId);
    if (!email) {
      logger.error({ tags: this.tags }, `Email ${emailId} not found`);
      throw new ValidationError("Email not found");
    }
    // Just be sure the profile has a valid email config
    await this.services.apis.getEmailClient(email.profileId);

    await this.database.models.Email.updateOne({ id: emailId }, { status: "processing" });

    if (email.recipientEmail) {
      await this.services.admin.emails.sendEmail({
        emailId,
        recipientEmails: [email.recipientEmail],
      });
      await this.database.models.Email.updateOne({ id: emailId }, { status: "processed" });
      logger.info({ tags: this.tags }, `Email ${emailId} processed`);
      return;
    }

    if (email.emailListId) {
      const emailList = await this.database.models.EmailList.findById(email.emailListId);
      if (!emailList) {
        logger.error({ tags: this.tags }, `Email list ${email.emailListId} not found`);
        throw new ValidationError("Email list not found");
      }

      const subscribers = await this.database.models.EmailListSubscriber.find({ emailListId: emailList.id }, (qb) => {
        return qb
          .orderBy("id", "asc")
          .limit(50)
          .where((eb) => {
            const conditions: Expression<SqlBool>[] = [];
            if (cursor) {
              conditions.push(eb("id", ">", cursor));
            }
            return eb.and(conditions);
          });
      });

      if (subscribers.length > 0) {
        await this.services.admin.emails.sendEmail({
          emailId,
          recipientEmails: subscribers.map((subscriber) => subscriber.email),
        });
        logger.info({ tags: this.tags }, `Sent email ${emailId} to ${subscribers.length} subscribers`);
        logger.info(
          { tags: this.tags },
          `Scheduling next email ${emailId} with cursor ${subscribers[subscribers.length - 1].id}`,
        );
        await this.workers.jobs.emails.processEmail.schedule(new Date(Date.now() + 1000), {
          emailId,
          cursor: subscribers[subscribers.length - 1].id,
        });
      } else {
        await this.database.models.Email.updateOne({ id: emailId }, { status: "processed" });
        logger.info({ tags: this.tags }, `Email ${emailId} processed`);
      }
      return;
    }
  }
}
