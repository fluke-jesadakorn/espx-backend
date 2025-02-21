import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderFactory } from './providers/provider.factory';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';
import { AiQueryService } from './ai-query.service';

// TODO: Future Feature - Add support for multiple AI providers configuration
// TODO: Future Feature - Add caching layer for frequent queries
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/ai-service/.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AiServiceController],
  providers: [
    {
      provide: 'AI_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const providerType = configService.get<string>('AI_PROVIDER_TYPE') || 'ollama';
        const config = {
          apiKey: configService.get<string>('OPENROUTER_API_KEY'),
          baseUrl: configService.get<string>('OPENROUTER_BASE_URL'),
          model: configService.get<string>('OPENROUTER_MODEL'),
        };
        return ProviderFactory.getProvider(providerType, config);
      },
      inject: [ConfigService],
    },
    AiQueryService,
    AiServiceService,
  ],
  exports: ['AI_PROVIDER', AiQueryService, AiQueryService],
})
export class AiModule {}
