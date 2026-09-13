export class CliValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliValidationError';
  }
}

export class CityNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CityNotFoundError';
  }
}

export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class HttpClientError extends HttpError {
  constructor(message, status) {
    super(message, status);
    this.name = 'HttpClientError';
  }
}

export class HttpServerError extends HttpError {
  constructor(message, status) {
    super(message, status);
    this.name = 'HttpServerError';
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class JsonParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JsonParseError';
  }
}
