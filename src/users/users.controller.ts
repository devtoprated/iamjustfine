import { Body, Controller, HttpCode, Req, Post, Res, UseGuards, UseInterceptors, HttpException, HttpStatus, UploadedFile, Get, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '.././dto/users/resgiter.dto'
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { checkInDto } from '.././dto/checkin/checkin.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EditProfileDto } from '.././dto/users/edit-profile.dto';
import * as fs from 'fs';
import { extname } from 'path'
import { checkinStatusInDto } from 'src/dto/checkin/checkinStatus.dto';
import { Cron } from '@nestjs/schedule';
import { PushNotificationDto } from 'src/dto/notification/push-notification.dto';

@Controller('user')
export class UsersController {
    constructor(
        private authService: AuthService,
        private userService: UsersService
    ) { }

    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @Post('registration')
    async register(@Body() registerDto: RegisterDto, @Res() res) {
        const response = await this.authService.register(registerDto, res);
        res.send(response);
    }

    @ApiTags('profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @Get('profile')
    @ApiBearerAuth()
    async getProfile(@Req() req, @Res() res) {
        const response = await this.userService.getProfile(res, req.user);
        res.send(response);
    }


    @ApiTags('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('update')
    @ApiConsumes('multipart/form-data')
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                picture: {
                    type: 'string',
                    format: 'binary',
                },
                dialCode: {
                    type: 'string',
                    default: "+91",
                },
                contactNumber: {
                    type: 'string',
                    default: "123456789",
                }
            },
        },
    })
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: (req, picture, cb) => {
                if (picture.mimetype == "image/jpeg" || picture.mimetype == "image/jpg" || picture.mimetype == "image/png") {
                    const directory = `./public/uploades`;
                    if (!fs.existsSync(directory)) {
                        fs.mkdirSync(directory, { recursive: true })
                    }
                    return cb(null, directory)
                } else {
                    return cb(new HttpException(`Unsupported picture type ${picture.originalname}`, HttpStatus.BAD_REQUEST), "false")
                }
            },
            filename: (req, picture, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                cb(null, `${randomName}${extname(picture.originalname)}`)
            }
        })
    }))
    async uploadeImage(@UploadedFile() picture: Express.Multer.File, @Body() editProfileDto: EditProfileDto, @Req() req, @Res() res) {
        let img = null;
        if (picture != undefined) {
            img = `uploades/${picture.filename}`;
        }

        let userId = req.user.sub

        const response = await this.userService.updateProfile(editProfileDto, img, res, userId);
        res.send(response)
    }

    @ApiTags('checkin')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @Post('checkin')
    @ApiBearerAuth()
    async checkin(@Body() healthstatus: checkInDto, @Req() req, @Res() res) {
        const response = await this.userService.checkin(healthstatus, res, req.user);
        res.send(response);
    }


    @ApiTags('checkin')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @Post('change/status')
    @ApiBearerAuth()
    async changeCheckInStatus(@Body() checkinStatus: checkinStatusInDto, @Req() req, @Res() res) {
        const response = await this.userService.changeCheckInStatus(checkinStatus, res, req.user);
        res.send(response);
    }

    @ApiTags('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('logout')
    async logoutUser(@Req() req, @Res() res) {
        const response = await this.userService.logoutUser(req, res, req.user)
        res.send(response);
    }


    @Cron('0 */1 * * * *')
    async runCron() {
        this.userService.notCheckinUsersCron();
    }

    @ApiTags('Account')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('delete/account')
    async deleteAccount(@Req() req, @Res() res) {
        const response = await this.userService.deleteAccount(req.user.sub, res)
        res.send(response);
    }

    @ApiTags('Push Notification')
    @Post('send-pushNoitification')
    async sendPushNotification(@Body() pushNotificationdto: PushNotificationDto, @Req() req, @Res() res) {
        const response = this.userService.sendDemoPushNotification(pushNotificationdto);
        res.send(response);
    }


    @ApiTags('Account')
    @Delete('delete-user-account/:contactNumber/:dialCode')
    @ApiParam({ name: 'contactNumber', type: String })
    @ApiParam({ name: 'dialCode', type: String })
    async deleteUserAccount(
        @Param('contactNumber') contactNumber: string,
        @Param('dialCode') dialCode: string,
        @Req() req,
        @Res() res
    ) {
        return await this.userService.deleteUserAccount(contactNumber, dialCode, req, res);
    }

}
