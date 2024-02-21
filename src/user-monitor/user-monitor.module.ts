import { Module } from '@nestjs/common';
import { UserMonitorService } from './user-monitor.service';
import { UserMonitorController } from './user-monitor.controller';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entity/user.entity';
import { Notification } from 'src/entity/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { JwtService } from '@nestjs/jwt';
import { Invitation } from 'src/entity/invitation.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';

@Module({
  controllers: [UserMonitorController],
  providers: [UserMonitorService, NotificationService, JwtService],
  imports: [TypeOrmModule.forFeature([UserMonitor, Users, Invitation, Notification, UserToken, NotificationLog])]
})
export class UserMonitorModule { }
