import { SettingService } from './setting.service';
import { Body, Controller, Post, Res, Headers, UseGuards, Patch, Get, Query, Req, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SettingDto } from 'src/dto/setting/setting.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @ApiTags('Setting')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOkResponse({ status: 200 })
  @Post('setting')
  async create(@Body() settingDto: SettingDto, @Res() res, @Req() req) {
    const response = await this.settingService.createSettingRecord(settingDto, res, req.user);
    res.send(response)
  }

  @ApiTags('Setting')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOkResponse({ status: 200 })
  @Get('setting/checkin/list')
  async getCheckInList(@Res() res, @Req() req) {
    const response = await this.settingService.getCheckinLIst(res, req.user);
    res.send(response)
  }
}