import { Injectable } from '@nestjs/common';
import { Storage } from './storage.interface';
import { LocalStorageConfig } from '../interfaces/backup-options.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorage implements Storage {
  constructor(private readonly config: LocalStorageConfig) {
    // Ensure backup directory exists
    fs.mkdir(config.path, { recursive: true });
  }

  async save(filePath: string, fileName: string): Promise<void> {
    const destinationPath = path.join(this.config.path, fileName);
    await fs.copyFile(filePath, destinationPath);
  }

  async get(fileName: string): Promise<Buffer> {
    const filePath = path.join(this.config.path, fileName);
    return fs.readFile(filePath);
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.config.path, fileName);
    await fs.unlink(filePath);
  }

  async list(): Promise<string[]> {
    return fs.readdir(this.config.path);
  }
} 