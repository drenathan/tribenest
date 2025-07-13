export interface IAttachment {
  filename?: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}

export interface IEmail {
  to: string | string[];
  from: string;
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  message: string;
  attachments?: IAttachment[];
}

export interface IGlobalVariables {
  images: {
    logo: string;
    favicon: string;
  };
}
