import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET_WORKDONE');
  }

  /**
   * Uploads a buffer to S3 and returns the public URL of the uploaded object.
   * @param buffer  File contents as a Buffer
   * @param key     S3 object key (e.g. `workdone/42/uuid.png`)
   * @param contentType  MIME type (e.g. `image/png`)
   */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    try {
      await this.client.send(new PutObjectCommand(params));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`S3 upload failed: ${errorMessage}`);
    }

    const region = this.configService.getOrThrow<string>('AWS_REGION');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
