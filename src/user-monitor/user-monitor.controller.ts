import { Body, Controller, Post, Res, Headers, UseGuards, Patch, Get, Query, Req, HttpCode } from '@nestjs/common';
import { UserMonitorService } from './user-monitor.service';
import { CreateUserMonitorDto } from '.././dto/userMonitor/create-monitor.dto';
import { StopMonitorDto } from 'src/dto/userMonitor/stop-monitor.dto';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('')
@UseGuards(JwtAuthGuard)
export class UserMonitorController {
  constructor(private readonly userMonitorService: UserMonitorService) { }

  @ApiTags('Helper')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOkResponse({ status: 200 })
  @Post('become/helper')
  async create(@Body() createUserMonitorDto: CreateUserMonitorDto, @Res() res, @Req() req) {
    const response = await this.userMonitorService.addAsHelper(createUserMonitorDto, res, req.user);
    res.send(response)
  }


  @ApiTags('Helper')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOkResponse({ status: 200 })
  @Post('stop/helping')
  async stopMonitoring(@Body() stopMonitorDto: StopMonitorDto, @Res() res, @Req() req) {
    const response = await this.userMonitorService.stopHelping(stopMonitorDto, res, req.user);
    res.send(response)
  }
}
