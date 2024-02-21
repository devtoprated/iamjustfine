import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from "../entity/user.entity";
import { Otp } from "../entity/otp.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { PassportModule } from '@nestjs/passport';
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
import { StripeService } from 'src/utilities/stripe.service';
import { Subscription } from 'src/entity/subscription.entity';

import { SubscriptionService } from 'src/subscription/subscription.service';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Otp, HealthStatus, Invitation, Notification, UserMonitor, Setting, UserToken, NotificationLog, Plans, MultipleUserSubscription, Subscription])],
    providers: [UsersService, AuthService, JwtService, NotificationService, StripeService, SubscriptionService, {
        provide: 'STRIPE_KEY',
        useValue: process.env.STRIPE_SECRET_KEY,
    }],
    controllers: [UsersController],
    exports: [UsersService, AuthService, JwtService, NotificationService, StripeService, SubscriptionService],
})
export class UserModule { }
