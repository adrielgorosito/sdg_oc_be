export class AfipError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly type: 'XML' | 'AUTH' | 'NETWORK' | 'VALIDATION',
  ) {
    super(message);
    this.name = 'AfipError';
  }
}

export class AfipXMLError extends AfipError {
  constructor(message: string) {
    super(message, 503, 'XML');
  }
}

export class AfipAuthError extends AfipError {
  constructor(message: string) {
    super(message, 503, 'AUTH');
  }
}

export class AfipNetworkError extends AfipError {
  constructor(message: string) {
    super(message, 503, 'NETWORK');
  }
}

export class AfipValidationError extends AfipError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION');
  }
}
