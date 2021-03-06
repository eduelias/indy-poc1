import { ConfigSchema } from '@Services/ConfigService';
import fs from 'fs';
import mkdirp from 'mkdirp';
import os from 'os';
import { join } from 'path';

export class PoolService {
  /**
   *
   */
  constructor(private config: ConfigSchema) {}

  private pathAsArray: string[] = [os.tmpdir(), 'indy'];

  public async getPoolGenesisTxnPath(poolName: string): Promise<string> {
    this.pathAsArray.push(`${poolName}.tx`);

    const path = join(...this.pathAsArray);
    await this.savePoolGenesisTxnFile(path);

    return path;
  }

  public poolGenesisTxnData(): string {
    return this.config.genesisTxn.map((gtx: any) => JSON.stringify(gtx)).join();
  }

  public async savePoolGenesisTxnFile(path: string): Promise<void> {
    const data = await this.poolGenesisTxnData();
    await this.mkdir(path);
    return fs.writeFileSync(path, data, 'utf8');
  }

  public async mkdir(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const folderPath = path
        .split('/')
        .slice(0, path.split('/').length - 1)
        .join('/');
      mkdirp(folderPath, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
