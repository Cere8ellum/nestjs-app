import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  database: process.env.TYPEORM_DATABASE,
  username: process.env.TYPEORM_USER,
  password: process.env.TYPEORM_PASSWORD,
  logging: true,
  logger: 'file',
  entities: ['./dist/**/*entity.{ts,js}'],
  //   migrationsTableName: 'migrations',
  //   migrations: ['dist/**/migrations/*.{ts,js}'],
  //   synchronize: process.env.NODE_ENV === 'local',
}));
