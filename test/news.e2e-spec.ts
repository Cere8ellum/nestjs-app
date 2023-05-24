import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { NewsModule } from '../src/modules/news/news.module';
import { NewsService } from '../src/modules/news/news.service';
import { INestApplication } from '@nestjs/common';

describe('News', () => {
  let app: INestApplication;
  let newsService = { findAll: () => [] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NewsModule],
    })
      .overrideProvider(NewsService)
      .useValue(newsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET news`, () => {
    return request(app.getHttpServer()).get('/news').expect(200).expect({
      data: newsService.findAll(),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
