import fs from 'fs';
import { Lazy, Schema } from 'yup';
import { getServiceName, getServiceNameUnsafe } from '../internal/serviceName';
import { paramCase } from 'change-case';
const fsp = fs.promises;
import EventEmitter from 'events';
import { log } from '../logging';
import { isLocalEnvironment } from './getEnvironment';

export type GetDataOptions = {
  exposeExceptions?: boolean;

  /**
   * when this boolean is true, then getData will save the default data if no data exists
   */
  saveDefaultDataOnError?: boolean;
};

export type SaveDataOption = {
  exposeExceptions?: boolean;
};

export type FileDatabaseType = {
  filePath?: string;
  validationSchema?: Schema | Lazy<unknown>;
};

const getDefaultPath = (serviceName: string): string => {
  return isLocalEnvironment() ? './db' : `/var/lib/danielhammerl/service-dbs/${paramCase(serviceName)}`;
};

export class FileDatabase<T> {
  private filePath?: string;
  private readonly validationSchema?: Schema | Lazy<unknown>;

  constructor(options: FileDatabaseType = { filePath: undefined, validationSchema: undefined }) {
    if (!options.filePath) {
      log('debug', 'fileDatabase filepath is not set ...');
      const serviceName = getServiceNameUnsafe();
      if (serviceName) {
        log('debug', '... but service name is set, so set default');

        this.filePath = getDefaultPath(serviceName);
      } else {
        log('debug', '... and service name is not set too, so initialize later');
        this.initializeLater();
      }
    } else {
      log('debug', `fileDatabase filepath is set to ${options.filePath}`);
      this.filePath = options.filePath;
    }
    this.validationSchema = options.validationSchema;
  }

  public async saveData(data: T, options: SaveDataOption = { exposeExceptions: true }): Promise<boolean> {
    if (!this.filePath) {
      if (getServiceNameUnsafe()) {
        this.filePath = getDefaultPath(getServiceName());
      } else {
        throw new Error('Cannot save data cause FileDatabase is not initialized yet');
      }
    }

    if (this.validationSchema) {
      try {
        this.validationSchema.validateSync(data);
      } catch (e: unknown) {
        if (options.exposeExceptions) {
          throw e;
        }
        return false;
      }
    }

    try {
      await fsp.mkdir(this.filePath.split('/').slice(0, -1).join('/'), { recursive: true });
      await fsp.writeFile(this.filePath, JSON.stringify(data));
      return true;
    } catch (e: unknown) {
      if (options.exposeExceptions) {
        throw e;
      }
      return false;
    }
  }

  public async getData(
    defaultData: T | null = null,
    options: GetDataOptions = { exposeExceptions: false, saveDefaultDataOnError: false }
  ): Promise<T | null> {
    if (!this.filePath) {
      if (getServiceNameUnsafe()) {
        this.filePath = getDefaultPath(getServiceName());
      } else {
        throw new Error('Cannot get data cause FileDatabase is not initialized yet');
      }
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath).toString());

        if (this.validationSchema) {
          this.validationSchema.validateSync(data);
        }

        return data;
      } catch (e: unknown) {
        if (options.exposeExceptions) {
          throw e;
        }
        return defaultData;
      }
    } else {
      if (defaultData && options.saveDefaultDataOnError) {
        await this.saveData(defaultData, { exposeExceptions: options.exposeExceptions });
      }
      return defaultData;
    }
  }

  private initializeLater = () => {
    const eventEmitter = new EventEmitter();
    eventEmitter.on('serviceNameSet', () => {
      log('debug', 'serviceNameSet event triggered: set fileDB filepath now');
      this.filePath = getDefaultPath(getServiceName());
    });
  };
}
