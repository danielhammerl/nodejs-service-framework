import fs from 'fs';
import { BaseSchema } from 'yup';
import { getServiceName, getServiceNameUnsafe } from '../internal/serviceName';
import { paramCase } from 'change-case';
const fsp = fs.promises;
import EventEmitter from 'events';

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
  validationSchema?: BaseSchema;
};

export class FileDatabase<T> {
  private filePath: string | null;
  private readonly validationSchema?: BaseSchema;

  constructor({ filePath, validationSchema }: FileDatabaseType) {
    if (!filePath) {
      const serviceName = getServiceNameUnsafe();
      if (serviceName) {
        this.filePath = `/var/lib/danielhammerl/${paramCase(serviceName)}`;
      } else {
        this.filePath = null;
        this.initializeLater();
      }
    } else {
      this.filePath = filePath;
    }
    this.validationSchema = validationSchema;
  }

  public async saveData(data: T, { exposeExceptions = false }: SaveDataOption): Promise<boolean> {
    if (!this.filePath) {
      throw new Error('Cannot save data cause FileDatabase is not initialized yet');
    }

    if (this.validationSchema) {
      try {
        this.validationSchema.validateSync(data);
      } catch (e: unknown) {
        if (exposeExceptions) {
          throw e;
        }
        return false;
      }
    }

    try {
      await fsp.writeFile(this.filePath, JSON.stringify(data));
      return true;
    } catch (e: unknown) {
      if (exposeExceptions) {
        throw e;
      }
      return false;
    }
  }

  public async getData(
    defaultData: T | null = null,
    { exposeExceptions = false, saveDefaultDataOnError = false }: GetDataOptions
  ): Promise<T | null> {
    if (!this.filePath) {
      throw new Error('Cannot save data cause FileDatabase is not initialized yet');
    }

    if (fs.existsSync(this.filePath)) {
      const data = JSON.parse(fs.readFileSync(this.filePath).toString());

      if (this.validationSchema) {
        try {
          this.validationSchema.validateSync(data);
          return data;
        } catch (e: unknown) {
          if (exposeExceptions) {
            throw e;
          }
          return defaultData;
        }
      }

      return data;
    } else {
      if (defaultData && saveDefaultDataOnError) {
        await this.saveData(defaultData, { exposeExceptions });
      }
      return defaultData;
    }
  }

  private initializeLater = () => {
    const eventEmitter = new EventEmitter();
    eventEmitter.on('serviceNameSet', () => {
      this.filePath = `/var/lib/danielhammerl/${paramCase(getServiceName())}`;
    });
  };
}
