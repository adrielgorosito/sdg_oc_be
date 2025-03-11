import { HttpException, HttpStatus } from '@nestjs/common';

export class AfipError extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    public readonly type: AfipErrorType,
  ) {
    super(
      {
        message,
        error: 'AfipError',
        type,
        statusCode,
      },
      statusCode,
    );
    this.name = 'AfipError';
  }
}

export class AfipXMLError extends AfipError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_ACCEPTABLE, AfipErrorType.XML);
  }
}

export class AfipAuthError extends AfipError {
  constructor(message: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, AfipErrorType.AUTH);
  }
}

export class AfipNetworkError extends AfipError {
  constructor(message: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, AfipErrorType.NETWORK);
  }
}

export class AfipValidationError extends AfipError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, AfipErrorType.VALIDATION);
  }
}

export enum AfipErrorType {
  XML = 'XML',
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  SERVICE = 'SERVICE',
}
