import { Request } from 'express';
import { Controller, Get, Post } from '../core';
import { Cache } from '../decorators';
import { RateLimit } from '../decorators';
import { RedisService } from '../services';

@Controller('books')
export class BookController {
  public books: number[];

  constructor(private readonly redis: RedisService) {
    this.books = [1, 2, 3];
  }

  @Get()
  @Cache({ ttl: 30000 })
  public getBooks() {
    return this.books;
  }

  @Get('rate-limit')
  @RateLimit({
    duration: 30,
    max: 1,
  })
  public async getBooksWithRatelimit() {
    return this.books;
  }

  @Post('pub-sub')
  public async publish(req: Request) {
    const payload = Object.assign({}, req.body);
    const rawPayload = JSON.stringify(payload);

    await this.redis.publish('pub-sub-redis', rawPayload);

    return {
      message: 'Published',
    };
  }
}
