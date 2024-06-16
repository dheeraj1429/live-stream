import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';

@Injectable()
export class DirectoryService {
  protected readonly logger = new Logger(DirectoryService.name);

  async createDirectory(dir: string): Promise<string> {
    try {
      try {
        await fsPromises.access(dir);
        return dir;
      } catch (err) {
        await fsPromises.mkdir(dir, { recursive: true });
        return dir;
      }
    } catch (error) {
      this.logger.error(`Failed to create directory: ${error.message}`);
      throw new InternalServerErrorException(`Failed to create directory: ${error.message}`);
    }
  }

  async removeDirectory(dir: string): Promise<string> {
    try {
      await fsPromises.rm(dir);
      return dir;
    } catch (error) {
      this.logger.error(`Failed to remove directory: ${error.message}`);
      throw new InternalServerErrorException(`Failed to remove directory: ${error.message}`);
    }
  }
}
