import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  
  const config = app.get(ConfigService);
  const jwtSecret = config.get<string>("JWT_SECRET");
  if (!jwtSecret) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not set!");
    console.error("The application cannot start without a secure JWT_SECRET.");
    process.exit(1);
  }


  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false
    })
  );

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, "127.0.0.1");
  console.log(`API pronta em http://127.0.0.1:${port}/api`);
}

bootstrap();
