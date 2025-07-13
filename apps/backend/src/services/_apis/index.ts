import S3Service from "./s3";

export default class ApiServices {
  public readonly s3: S3Service;

  constructor() {
    this.s3 = new S3Service();
  }

  public async getFileSize(url: string): Promise<number> {
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength) : 0;
  }
}
