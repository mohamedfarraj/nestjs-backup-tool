import { Injectable, Logger } from '@nestjs/common';
import { Storage } from './storage.interface';
import { S3StorageConfig } from '../interfaces/backup-options.interface';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';

@Injectable()
export class S3Storage implements Storage {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Storage.name);

  constructor(private readonly config: S3StorageConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async save(filePath: string, fileName: string): Promise<void> {
    const fileContent = await fs.readFile(filePath);
    
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
        Body: fileContent,
      })
    );
  }

  async get(fileName: string): Promise<Buffer> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
      })
    );

    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }

  async delete(fileName: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
      })
    );
  }

  async list(): Promise<string[]> {
    const response = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.config.bucketName,
      })
    );

    return (response.Contents || []).map(item => item.Key).filter((key): key is string => !!key);
  }
} 