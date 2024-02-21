import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Invitation } from 'src/entity/invitation.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/entity/notification.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';

@Module({
  providers: [InvitationService, JwtService, NotificationService],
  controllers: [InvitationController],
  imports: [TypeOrmModule.forFeature([Users, Invitation, Notification, UserToken, NotificationLog])]
})
export class InvitationModule { }
