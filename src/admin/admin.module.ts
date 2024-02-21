import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { HealthStatus } from 'src/entity/health-status.entity';
import { Invitation } from 'src/entity/invitation.entity';
import { Otp } from 'src/entity/otp.entity';
import { Setting } from 'src/entity/setting.entity';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Users } from 'src/entity/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { StripeService } from '../utilities/stripe.service';

import { UsersController } from 'src/users/users.controller';
import { UserModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { adminpanel } from 'src/entity/adminpanel.entity';
import { Notification } from 'src/entity/notification.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';

import { Plans } from 'src/entity/plans.entity';

@Module({
    imports: [TypeOrmModule.forFeature([adminpanel, Users, HealthStatus,Plans,
        Invitation,
        UserMonitor,
        Notification,
        Setting,
        NotificationLog,
        Subscription,
        MultipleUserSubscription
    ])],
    
    providers: [{
        provide: 'STRIPE_KEY',
        useValue:process.env.STRIPE_SECRET_KEY, // Replace with your actual Stripe key
    },StripeService,AdminService, UsersService, NotificationService],
    controllers: [AdminController],
    exports: [AdminModule]
})
export class AdminModule { }
