export interface TErrorSources {
  path: string;
  message: string;
  // errorSources?: any;
}

export interface TGenericErrorResponse {
  statusCode: number;
  message: string;
  errorSources?: TErrorSources[];
}
