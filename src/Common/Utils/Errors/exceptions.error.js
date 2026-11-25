export class BadRequestException extends Error {
  constructor(message = 'Bad Request', details = null, code = 'BAD_REQUEST') {
    super(message);
    this.name = 'BadRequestException';
    this.statusCode = 400;
    this.details = details;
    this.code = code;
  }
}

export class NotFoundException extends Error {
  constructor(message = 'Resource Not Found', details = null, code = 'NOT_FOUND') {
    super(message);
    this.name = 'NotFoundException';
    this.statusCode = 404;
    this.details = details;
    this.code = code;
  }
}

export class UnauthorizedException extends Error {
  constructor(message = 'Unauthorized', details = null, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'UnauthorizedException';
    this.statusCode = 401;
    this.details = details;
    this.code = code;
  }
}

export class ForbiddenException extends Error {
  constructor(message = 'Forbidden', details = null, code = 'FORBIDDEN') {
    super(message);
    this.name = 'ForbiddenException';
    this.statusCode = 403;
    this.details = details;
    this.code = code;
  }
}

export default {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException
};
