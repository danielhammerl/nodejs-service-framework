import fs from 'fs';
import { BaseSchema } from 'yup';
const fsp = fs.promises;

export class FileDatabase<T> {
  private readonly filePath: string;
  private readonly validationSchema?: BaseSchema;

  constructor(filePath: string, validationSchema?: BaseSchema) {
    this.filePath = filePath;
    this.validationSchema = validationSchema;
  }

  public async saveData(data: T, exposeExceptions = false): Promise<boolean> {
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

  public getData(exposeExceptions = false): T | null {
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
          return null;
        }
      }

      return data;
    }

    return null;
  }
}
