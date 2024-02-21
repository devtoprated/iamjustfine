import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { Users } from '../entity/user.entity';
import { Otp } from '../entity/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../config/jwt-constants';
import { AuthService } from '../auth/auth.service';
import { Setting } from 'src/entity/setting.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { Notification } from 'src/entity/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationLog } from 'src/entity/notification-log.entity';
import { AppConfiguration } from 'src/entity/configuration.entity';

@Module({
    providers: [OtpService, AuthService, NotificationService],
    controllers: [OtpController],
    imports: [TypeOrmModule.forFeature([Users, Otp, Setting, UserToken, Notification, NotificationLog, AppConfiguration]),
    JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '360d' },
    })],
    exports: [OtpModule]
})
export class OtpModule { }
