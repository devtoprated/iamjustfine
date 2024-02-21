import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users/users.service';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Users } from './entity/user.entity';
import { Otp } from './entity/otp.entity';
import { OtpModule } from './otp/otp.module';
import { HealthStatus } from './entity/health-status.entity';
import { NotificationModule } from './notification/notification.module';
import { Invitation } from './entity/invitation.entity';
import { InvitationModule } from './invitation/invitation.module';
import { Notification } from './entity/notification.entity';
import { UserMonitorModule } from './user-monitor/user-monitor.module';
import { UserMonitor } from './entity/user-monitor.entity';
import { Setting } from './entity/setting.entity';
import { Subscription } from './entity/subscription.entity';

import { SettingModule } from './setting/setting.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserToken } from './entity/user-token.entity';
import { NotificationLog } from './entity/notification-log.entity';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { adminpanel } from './entity/adminpanel.entity';
import { AppConfiguration } from './entity/configuration.entity';
import { Plans } from './entity/plans.entity';

import { AppConfigurationModule } from './admin/app-configuration/app-configuration.module';
import { AdminSeederService } from './admin-seeder/admin-seeder.service';

import { SubscriptionModule } from './subscription/subscription.module';
import { WebhookModule } from './webhook/webhook.module';
import { MultipleUserSubscription } from './entity/multipleUserSubscription.entity';


const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [TypeOrmModule.forFeature([adminpanel]),
    envModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Users, Otp, HealthStatus, Invitation,
        Notification, UserMonitor, Setting,
        UserToken, NotificationLog, adminpanel,
        AppConfiguration,Plans,Subscription,MultipleUserSubscription
      ],
      migrations: ['dist/**/migrations/*.js'],
      migrationsTableName: "migrations",
      migrationsRun: true,
      synchronize: false,
      logging: true
    }),
    AuthModule,
    UserModule,
    OtpModule,
    NotificationModule,
    InvitationModule,
    UserMonitorModule,
    SettingModule,
    EmailModule,
    AdminModule,
    AppConfigurationModule,
    SubscriptionModule,
    WebhookModule
  ],
  controllers: [AppController],
  providers: [AppService, AdminSeederService],
  exports: [AppService]
})
export class AppModule { }
