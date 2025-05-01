export class BaseResponseDto<T> {
  success: boolean;
  message: string;
  result: T;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.result = data;
  }

  static success<T>(data: T, message: string = 'Success'): BaseResponseDto<T> {
    return new BaseResponseDto<T>(true, message, data);
  }

  static error<T>(
    message: string = 'Error',
    data?: T,
  ): BaseResponseDto<T | null> {
    return new BaseResponseDto<T | null>(false, message, data || null);
  }
}
