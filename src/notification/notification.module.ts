import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from "../entity/otp.entity"
import { Users } from "../entity/user.entity";
import { HealthStatus } from '../entity/health-status.entity';
import { NotificationController } from './notification.controller';
import { Notification } from 'src/entity/notification.entity';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from 'src/entity/user-token.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';

@Module({
  providers: [NotificationService, JwtService],
  imports: [TypeOrmModule.forFeature([Users, Otp, HealthStatus, Notification, UserToken, NotificationLog])],
  controllers: [NotificationController],
  exports: [NotificationModule]
})
export class NotificationModule { }
