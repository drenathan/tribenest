import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { createEmailList } from "./commands/createEmailList";
import { createEmailTemplate } from "./commands/createEmailTemplate";
import { createEmail } from "./commands/createEmail";
import { getEmailList } from "./queries/getEmailList";
import { getEmailLists } from "./queries/getEmailLists";
import { getEmailTemplates } from "./queries/getEmailTemplates";
import { getEmailTemplate } from "./queries/getEmailTemplate";
import { getEmail } from "./queries/getEmail";
import { getEmails } from "./queries/getEmails";
import { updateEmailList } from "./commands/updateEmailList";
import { updateEmailTemplate } from "./commands/updateEmailTemplate";
import { sendEmail } from "./commands/sendEmail";
import { sendTestEmail } from "./commands/sendTestEmail";

export class EmailService extends BaseService {
  public readonly createEmailList = createEmailList;
  public readonly createEmailTemplate = createEmailTemplate;
  public readonly createEmail = createEmail;
  public readonly getEmailLists = getEmailLists;
  public readonly getEmailTemplates = getEmailTemplates;
  public readonly getEmailTemplate = getEmailTemplate;
  public readonly getEmail = getEmail;
  public readonly getEmailList = getEmailList;
  public readonly getEmails = getEmails;
  public readonly updateEmailList = updateEmailList;
  public readonly updateEmailTemplate = updateEmailTemplate;
  public readonly sendEmail = sendEmail;
  public readonly sendTestEmail = sendTestEmail;
  constructor(args: BaseServiceArgs) {
    super(args);
    this.createEmailList = createEmailList.bind(this);
    this.createEmailTemplate = createEmailTemplate.bind(this);
    this.createEmail = createEmail.bind(this);
    this.getEmailLists = getEmailLists.bind(this);
    this.getEmailList = getEmailList.bind(this);
    this.getEmailTemplates = getEmailTemplates.bind(this);
    this.getEmailTemplate = getEmailTemplate.bind(this);
    this.getEmail = getEmail.bind(this);
    this.getEmails = getEmails.bind(this);
    this.updateEmailList = updateEmailList.bind(this);
    this.updateEmailTemplate = updateEmailTemplate.bind(this);
    this.sendEmail = sendEmail.bind(this);
    this.sendTestEmail = sendTestEmail.bind(this);
  }
}
