export class AppException extends Error {
  code?: string;
  customLogMessage?: string;
  innerError?: Error;
  constructor(
    message: string,
    code?: string,
    innerError?: any,
    customLogMessage?: string
  ) {
    super(message);
    this.code = code;
    this.customLogMessage = customLogMessage;
    this.innerError = innerError instanceof Error ? innerError : undefined;
  }
}
