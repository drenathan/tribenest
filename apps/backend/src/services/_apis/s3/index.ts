import { getConfig } from "@src/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default class S3Service {
  private client: S3Client;
  private s3Config = getConfig("s3");

  constructor() {
    if (!this.s3Config) {
      throw new Error("S3 config is not defined");
    }

    const { accessKeyId, secretAccessKey, url, region } = this.s3Config;
    this.client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, endpoint: url, region });
  }

  public async getPresignedUrl(key: string) {
    const command = new PutObjectCommand({ Bucket: this.s3Config.bucketName, Key: key });
    const presignedUrl = await getSignedUrl(this.client, command, { expiresIn: this.s3Config.presignedUrlExpiration });
    const remoteUrl = `${this.s3Config.bucketUrl}/${key}`;
    console.log({ presignedUrl, remoteUrl });
    return { presignedUrl, remoteUrl };
  }
}
