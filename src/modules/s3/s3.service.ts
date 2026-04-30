import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;
  private defaultTtl: number;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET_DECORAI');
    const rawTtl = this.configService.get<number>('S3_PRESIGNED_TTL_SECONDS') ?? 86400;
    // AWS SigV4 max is 7 days (604800s); enforce sane bounds
    this.defaultTtl = Math.min(Math.max(Number(rawTtl), 1), 604800);
  }

  /**
   * Uploads a buffer to S3 and returns the S3 object key.
   * @param buffer       File contents as a Buffer
   * @param key          S3 object key (e.g. `worksdone/users/42/uuid.png`)
   * @param contentType  MIME type (e.g. `image/png`)
   */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    try {
      await this.client.send(new PutObjectCommand(uploadParams));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`S3 upload failed: ${errorMessage}`);
    }

    return key;
  }

  /**
   * Generates a presigned GET URL for an existing S3 object key.
   * @param key        S3 object key
   * @param expiresIn  TTL in seconds (defaults to S3_PRESIGNED_TTL_SECONDS env or 24h)
   */
  async getPresignedReadUrl(key: string, expiresIn?: number): Promise<string> {
    const ttl = expiresIn ?? this.defaultTtl;
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: ttl });
  }

  /**
   * Builds an S3 key for a user's workdone image.
   * Path: worksdone/users/{userId}/{uuid}.{ext}
   * @param userId  Authenticated user's numeric ID
   * @param ext     File extension without dot (default: 'png')
   */
  buildUserWorkdoneKey(userId: number, ext = 'png'): string {
    if (!userId || userId <= 0) {
      throw new BadRequestException('Invalid userId for S3 key generation');
    }
    return `worksdone/users/${userId}/${randomUUID()}.${ext}`;
  }
}
