export class HttpError extends Error {
  constructor(private errorMsg: string, public statusCode: number) {
    super(errorMsg);
  }
}
