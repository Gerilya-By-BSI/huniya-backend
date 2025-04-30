/* eslint-disable no-prototype-builtins */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        try {
          if (typeof data === 'object' && data !== null) {
            // Recursively convert BigInt values to strings
            this.convertBigIntToString(data);
          }
          return data;
        } catch (error) {
          return data;
        }
      }),
    );
  }

  private convertBigIntToString(obj: Record<string, any>): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'bigint') {
          obj[key] = obj[key].toString();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.convertBigIntToString(obj[key]);
        }
      }
    }
  }
}
