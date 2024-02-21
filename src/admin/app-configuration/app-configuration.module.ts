import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthStatus } from 'src/entity/health-status.entity';
import { Invitation } from 'src/entity/invitation.entity';
import { Setting } from 'src/entity/setting.entity';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Users } from 'src/entity/user.entity';
import { AppConfigurationService } from 'src/admin/app-configuration/app-configuration.service';
import { adminpanel } from 'src/entity/adminpanel.entity';
import {  } from 'src/entity/notification.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';
import { AppConfiguration } from 'src/entity/configuration.entity'
import { AppConfigurationController } from 'src/admin/app-configuration/app-configuration.controller'

@Module({
    imports: [TypeOrmModule.forFeature([adminpanel, Users, HealthStatus,
        Invitation,
        UserMonitor,
        Setting,
        NotificationLog,
        AppConfiguration
    ])],
    providers: [AppConfigurationService],
    controllers: [AppConfigurationController],
    exports: [AppConfigurationModule]
})
export class AppConfigurationModule { }
