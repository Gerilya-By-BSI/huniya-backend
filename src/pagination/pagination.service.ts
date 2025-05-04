import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService<T> {
  paginate(data: T[], total: number, page: number, limit: number): Paginate<T> {
    return new Paginate(
      data,
      total,
      this.validatePage(page, total, limit),
      this.validateLimit(limit),
    );
  }

  validatePage(page: number, total: number, limit: number) {
    if (page < 1 || page > Math.ceil(total / limit)) {
      return 1;
    }

    return page;
  }

  validateLimit(limit: number) {
    if (limit < 1) {
      return 1;
    }

    return limit;
  }
}

export class Paginate<T> {
  meta: {
    total: number;
    last_page: number;
    current_page: number;
    limit: number;
    prev: number | null;
    next: number | null;
  };
  data: T[];

  constructor(data: T[], total: number, page: number, limit: number) {
    this.meta = {
      total,
      last_page: Math.ceil(total / limit),
      current_page: page,
      limit,
      prev: page === 1 ? null : page - 1,
      next: total === 0 || page === Math.ceil(total / limit) ? null : page + 1,
    };
    this.data = data;
  }
}
