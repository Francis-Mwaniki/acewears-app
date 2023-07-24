import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
import { IoAdapter } from '@nestjs/platform-socket.io';
// import cors from 'cors-ts';
const port = process.env.PORT || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors({
  //   origin: 'http://localhost:3001',
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   credentials: true,
  // });

  /* enable sockets */
  // app.enableCors({
  //   origin: 'http://localhost:3000',
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   credentials: true,
  // });

  /* use node 18 */
  // app.use(
  //   (
  //     req: any,
  //     res: { header: (arg0: string, arg1: string) => void },
  //     next: () => void,
  //   ) => {
  //     res.header('Access-Control-Allow-Origin', '*');
  //     next();
  //   },
  // );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('E-commerce server')
    .setDescription('E-Commerce description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0');
}
bootstrap();
