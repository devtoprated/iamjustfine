import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { StripeService } from '../utilities/stripe.service';

import { SubscriptionController } from './subscription.controller';
import { Users } from "../entity/user.entity";
import { Otp } from "../entity/otp.entity"
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { HealthStatus } from 'src/entity/health-status.entity';
import { Invitation } from 'src/entity/invitation.entity';
import { Notification } from '../entity/notification.entity';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Setting } from 'src/entity/setting.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { Plans } from 'src/entity/plans.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Otp,
        PassportModule, Subscription, UserToken, Plans,MultipleUserSubscription
    ])],
    providers: [{
        provide: 'STRIPE_KEY',
        useValue: process.env.STRIPE_SECRET_KEY, // Replace with your actual Stripe key
    },StripeService, SubscriptionService, JwtService],
    controllers: [SubscriptionController],
    exports: [SubscriptionModule]
})
export class SubscriptionModule { }