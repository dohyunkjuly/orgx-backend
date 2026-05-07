import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { HttpExceptionFilter, ApiResponseInterceptor } from '@lib/core'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000'),
    credentials: true, // required to send/receive httpOnly cookies cross-origin
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalInterceptors(new ApiResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Organization X API')
    .setDescription('Organization X portal backend')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('accessToken') // <-- so /me etc show as authenticated in Swagger
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(process.env.PORT ?? 8080)
}
bootstrap()
