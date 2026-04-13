import { Module, Global } from '@nestjs/common';
import { ClaudeService } from './services/claude.service';

@Global()
@Module({
  providers: [ClaudeService],
  exports: [ClaudeService],
})
export class AiModule {}
