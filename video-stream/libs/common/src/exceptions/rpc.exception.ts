import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class RCPValidationException implements ExceptionFilter {
  private readonly logger = new Logger(RCPValidationException.name);

  catch(exception: HttpException) {
    this.logger.error({ exception: exception.getResponse() });
    return exception.getResponse();
  }
}
