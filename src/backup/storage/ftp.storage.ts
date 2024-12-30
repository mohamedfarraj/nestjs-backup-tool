import { Injectable, Logger } from '@nestjs/common';
import { Storage } from './storage.interface';
import { FTPStorageConfig } from '../interfaces/backup-options.interface';
import * as Client from 'ftp';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

@Injectable()
export class FTPStorage implements Storage {
  private client: Client;
  private readonly logger = new Logger(FTPStorage.name);

  constructor(private readonly config: FTPStorageConfig) {
    this.client = new Client();
    this.client.connect({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port || 21,
    });
  }

  async save(filePath: string, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      this.client.put(readStream, fileName, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async get(fileName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.client.get(fileName, (err, stream) => {
        if (err) reject(err);
        
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err) => reject(err));
      });
    });
  }

  async delete(fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.delete(fileName, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async list(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.client.list((err, list) => {
        if (err) reject(err);
        resolve(list.map(item => item.name));
      });
    });
  }
} 