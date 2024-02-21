import { Body, Controller, Get, HttpCode, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetNotificationDto } from '.././dto/notification/get-notification.dto';
import { ReadNotificationDto } from '.././dto/notification/read-notification.dto';
import { DeleteNotificationDto } from 'src/dto/notification/delete-notification.dto';

@Controller('notification')
export class NotificationController {
    constructor(
        private notificationService: NotificationService
    ) { }

    @ApiTags('Notification')
    @Post('get-list')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBearerAuth()
    async inviteUser(@Body() getNotificationDto: GetNotificationDto, @Req() req, @Res() res) {
        const response = await this.notificationService.getNotificationList(getNotificationDto, res, req.user);
        res.send(response)
    }

    @ApiTags('Notification')
    @Get('read-notification')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBearerAuth()
    async markRead(@Query() readNotificationDto: ReadNotificationDto, @Req() req, @Res() res) {
        const response = await this.notificationService.readNotification(readNotificationDto, res, req.user);
        res.send(response)
    }

    @ApiTags('Notification')
    @Post('delete-notification')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBearerAuth()
    async deleteNotification(@Body() deleteNotificationDto: DeleteNotificationDto, @Req() req, @Res() res) {
        const response = await this.notificationService.deleteNotification(deleteNotificationDto, res, req.user);
        res.send(response)
    }
}
