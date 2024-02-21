import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entity/user.entity';
import { Setting } from 'src/entity/setting.entity';
import { UserToken } from 'src/entity/user-token.entity';

@Module({
  controllers: [SettingController],
  providers: [SettingService, JwtService],
  imports: [TypeOrmModule.forFeature([Users, Setting, UserToken])]
})
export class SettingModule { }
