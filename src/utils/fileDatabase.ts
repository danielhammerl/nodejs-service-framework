import fs from 'fs';
import { BaseSchema } from 'yup';
import { getServiceName } from '../internal/serviceName';
import { paramCase } from 'change-case';
const fsp = fs.promises;

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
  private readonly filePath: string;
  private readonly validationSchema?: BaseSchema;

  constructor({
    filePath = `/var/lib/danielhammerl/${paramCase(getServiceName())}`,
    validationSchema,
  }: FileDatabaseType) {
    this.filePath = filePath;
    this.validationSchema = validationSchema;
  }

  public async saveData(data: T, { exposeExceptions = false }: SaveDataOption): Promise<boolean> {
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

    return defaultData;
  }
}
