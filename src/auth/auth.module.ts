import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../config/jwt-constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Otp } from 'src/entity/otp.entity';
import { UsersService } from 'src/users/users.service';
import { LocalStrategy } from './local.auth';
import { JwtService } from '@nestjs/jwt';
import { HealthStatus } from 'src/entity/health-status.entity';
import { Invitation } from 'src/entity/invitation.entity';
import { NotificationService } from 'src/notification/notification.service';

import { Notification } from '../entity/notification.entity';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Setting } from 'src/entity/setting.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';
import { Plans } from 'src/entity/plans.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { Subscription } from 'src/entity/subscription.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Users, Otp, Setting, Invitation, Setting,
            HealthStatus, PassportModule, Notification, UserMonitor,
            UserToken, NotificationLog, Plans, MultipleUserSubscription, Subscription
        ]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '360d' },
        }),
    ],
    providers: [AuthService, UsersService, LocalStrategy, JwtService, NotificationService],
    exports: [AuthModule],
    controllers: [AuthController],
})
export class AuthModule { }
