export class InvalidConfigurationException extends Error {
  constructor(configKey: string) {
    super(`Invalid configuration detected! Affected config property: ${configKey}`);
    this.configKey = configKey;
  }

  configKey: string;
}
