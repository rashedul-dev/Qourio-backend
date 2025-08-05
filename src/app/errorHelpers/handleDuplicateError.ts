import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const matchArray = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `${matchArray[1]} already Exist!!`,
  };
};
