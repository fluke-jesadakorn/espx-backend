import { Logger } from '@nestjs/common';
import { AIProvider, ProviderType } from '../types/interfaces';
import { OllamaProvider } from './ollama.provider';
import { OpenRouterProvider } from './openrouter.provider';

export class ProviderFactory {
  private static readonly logger = new Logger(ProviderFactory.name);

  static getProvider(providerType: string, config: any = {}): AIProvider {
    switch (providerType.toLowerCase() as ProviderType) {
      case 'openrouter':
        const provider = new OpenRouterProvider();
        provider.validateConfig(config);
        return provider;
      case 'ollama':
        return new OllamaProvider();
      default:
        this.logger.error(`Unsupported AI provider: ${providerType}`);
        throw new Error(`Unsupported AI provider: ${providerType}`);
    }
  }
}
