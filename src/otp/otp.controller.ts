import { Body, Controller, Get, Post, Req, Res, Headers, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResendOtp } from '../dto/otp/resend-otp.dto';
import { VerifyOtpDto } from '../dto/otp/verify-otp.dto';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VerifyProfileOtpDto } from '../dto/otp/verify-profile-otp.dto';
import { ConfigurationDto } from '../dto/users/configuration.dto'

@Controller()

export class OtpController {
    constructor(
        private otpService: OtpService
    ) { }

    @ApiTags('otp')
    @Post('otp/verify')
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res) {
        const response = await this.otpService.verifyOtp(verifyOtpDto, res);
        res.send(response)
    }

    @ApiTags('otp')
    @Post('resent/otp')
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async resentOtp(@Body() resendOtp: ResendOtp, @Req() req, @Res() res) {
        const response = await this.otpService.resentOtp(resendOtp, res);
        res.send(response)
    }

    @ApiTags('profile')
    @Post('profile/resent/otp')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateProfileOtp(@Body() resendOtp: ResendOtp, @Req() req, @Res() res) {
        const response = await this.otpService.updateProfileOtp(resendOtp, res, req.user.sub);
        res.send(response)
    }


    @ApiTags('profile')
    @Post('profile/otp/verification')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateOtpVerification(@Body() verifyOtpDto: VerifyProfileOtpDto, @Req() req, @Res() res) {
        const response = await this.otpService.updateOtpVerification(verifyOtpDto, res, req.user.sub);
        res.send(response)
    }

    @ApiTags('configuration')
    @Post('configuration/detail')
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async configurationDetail(@Body() configDto: ConfigurationDto, @Req() req, @Res() res) {
        const response = await this.otpService.configurationDetail(configDto, res);
        res.send(response)
    }

    @ApiTags('Approve')
    @Post('approve/user')
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async approveUser(@Body() configDto: ConfigurationDto, @Req() req, @Res() res) {
        const response = await this.otpService.approveUser(configDto, res);
        res.send(response)
    }


    @ApiTags('Demo Email')
    @Get('demo/email')
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async demoEmail(@Req() req, @Res() res) {
        const response = await this.otpService.demoEmailSend();
        res.send(response)
    }

}


