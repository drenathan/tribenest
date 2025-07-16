import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";

type S3Config = {
  accessKeyId: string;
  secretAccessKey: string;
  url: string;
  region: string;
  bucketName: string;
  bucketUrl: string;
};
export default class S3Service {
  private client: S3Client;

  constructor(private s3Config: S3Config) {
    const { accessKeyId, secretAccessKey, url, region } = this.s3Config;
    this.client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint: url,
      region,
      forcePathStyle: true, // Required for some S3-compatible services
      maxAttempts: 3, // Built-in retry logic
    });
  }

  public async testConnection() {
    const command = new ListObjectsV2Command({ Bucket: this.s3Config.bucketName, MaxKeys: 1 });
    await this.client.send(command);
  }

  public async getPresignedUrl(key: string) {
    const command = new PutObjectCommand({ Bucket: this.s3Config.bucketName, Key: key });
    const presignedUrl = await getSignedUrl(this.client, command, { expiresIn: 60 * 60 * 30 }); // 30 minutes
    const remoteUrl = `${this.s3Config.bucketUrl}/${key}`;
    return { presignedUrl, remoteUrl };
  }

  public async uploadFile(filePath: string, key: string): Promise<string> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const command = new PutObjectCommand({
          Bucket: this.s3Config.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: this.getContentType(key),
        });

        await this.client.send(command);
        return `${this.s3Config.bucketUrl}/${key}`;
      } catch (error) {
        lastError = error;
        console.error(`Failed to upload file ${filePath} to S3 (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to upload file to S3 after ${maxRetries} attempts: ${lastError}`);
  }

  private getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "zip":
        return "application/zip";
      case "mp3":
        return "audio/mpeg";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "pdf":
        return "application/pdf";
      default:
        return "application/octet-stream";
    }
  }
}
