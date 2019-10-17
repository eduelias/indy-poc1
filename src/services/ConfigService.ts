import fs from 'fs';
import path from 'path';

export class ConfigService {
  static Instance: any = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private loadMainPackageJSON(attempts?: number): any {
    attempts = attempts || 1;
    if (attempts > 5) {
      throw new Error("Can't resolve main package.json file");
    }
    const mainPath = attempts === 1 ? './' : Array(attempts).join('../');
    try {
      if (!require || !require.main || !require.main.require) {
        throw new Error('aahhhhhh');
      }
      return require.main.require(mainPath + 'package.json');
    } catch (e) {
      return this.loadMainPackageJSON(attempts + 1);
    }
  }

  private configTypes = ['env', 'deployment', 'user'];

  private getFileName(levelName: string): string {
    switch (levelName) {
      case 'env':
        return `${process.env.NODE_ENV}.json`;
      case 'deployment':
        return `${process.env.DEPLOY || 'local'}.json`;
      case 'user':
        return `${process.env.USER || 'guest'}.json`;
      default:
        return `${process.env[levelName]}.json`;
    }
  }

  private getConfigDir(finalPath: string[]): string {
    const pkg = this.loadMainPackageJSON();
    pkg.configManager = pkg.configManager || {
      path: `/${__dirname}/../../config`,
    };

    const configpath = pkg.configManager.path.split('/');

    return path.join(...configpath, ...finalPath);
  }

  private mergeEnv(propertyValue: any): any {
    if (propertyValue.indexOf('@@') >= 0) {
      const propName = propertyValue.replace('@@', '');
      if (process.env[propName]) {
        return process.env[propName];
      }
    }
    return propertyValue;
  }

  private loadEnv(loadedObject: any): any {
    const newObject: any = {};
    Object.keys(loadedObject).map((propertyName) => {
      newObject[propertyName] = this.mergeEnv(loadedObject[propertyName]);
    });
    return newObject;
  }

  public GetConfig(): ConfigSchema {
    if (!ConfigService.Instance) {
      let cfg = this.loadEnv(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require(`/${this.getConfigDir(['default.json'])}`),
      );
      this.configTypes.map((level) => {
        const fullPathFile = `/${this.getConfigDir([
          level,
          this.getFileName(level),
        ])}`;
        if (fs.existsSync(fullPathFile)) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const loadedObject = require(fullPathFile);
          cfg = Object.assign(cfg, this.loadEnv(loadedObject));
        }
      });
      ConfigService.Instance = cfg;
    }
    return ConfigService.Instance;
  }
}

export interface ConfigSchema {
  poolName: string;
  port: number;
  genesisTxn: any;
}
