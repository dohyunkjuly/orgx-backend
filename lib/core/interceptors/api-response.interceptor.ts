import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiHttpResponse } from '../api/api-http-response';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Only wrap HTTP responses.
    if (context.getType() !== 'http') return next.handle();

    return next.handle().pipe(
      map((data) => {
        // If the controller already returned an ApiHttpResponse, don't double-wrap
        if (data instanceof ApiHttpResponse) return data;

        // Otherwise wrap the raw data
        return new ApiHttpResponse(200, 0, data, 'OK');
      }),
    );
  }
}