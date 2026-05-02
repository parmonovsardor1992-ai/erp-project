import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PeriodLocksController } from './period-locks.controller';
import { PeriodLocksService } from './period-locks.service';

@Module({
  imports: [PrismaModule],
  controllers: [PeriodLocksController],
  providers: [PeriodLocksService],
})
export class PeriodLocksModule {}
