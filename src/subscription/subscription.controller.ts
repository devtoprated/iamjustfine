import { Body, Controller, HttpCode, Req, Post, Res, UseGuards, UseInterceptors, HttpException, HttpStatus, UploadedFile, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { purchasePlanDto } from '.././dto/subscription/subscription.dto'
import { updateSubscriptionPlanDto } from 'src/dto/subscription/updateSubscriptionPlan.dto';
import { deleteSubscribedNumberDto } from 'src/dto/subscription/deleteSubscribedNumber.dto';


@Controller('subscription')
export class SubscriptionController {
    constructor(
        private subscriptionService: SubscriptionService
    ) { }

    @ApiTags('Subscription')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @Get('subscription-plans-list')
    @ApiBearerAuth()
    async subscriptionPlanList(@Req() req, @Res() res) {
        const response = await this.subscriptionService.subscriptionPlanList(res, req.user);
        res.send(response);
    }

    @ApiTags('Subscription')
    @Post('purchase-subscription-plan')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateStatus(@Body() purchasePlanDto: purchasePlanDto, @Req() req, @Res() res, err) {
        const response = await this.subscriptionService.purchaseSubscription(req, res, req.user);
        res.send(response)
    }

    
    @ApiTags('Subscription')
    @Get('cancelSubscription')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async cancelSubscriptionPlan(
        @Req() req,
        @Res() res,
        @Query() subscriptionId: string = "",
    ) {
        const response = await this.subscriptionService.cancelSubscription(req, res, subscriptionId);
        res.send(response);
    };

    @ApiTags('Subscription')
    @Post('update-subscription-plan')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateUserSubscriptionPlan(
        @Body() purchasePlanDto: updateSubscriptionPlanDto,
        @Req() req,
        @Res() res,
        @Query() subscriptionPlanId: string = "",
    ) {
        const response = await this.subscriptionService.updateUserSubscriptionPlan(req, res, subscriptionPlanId, purchasePlanDto);
        res.send(response);
    };


    @ApiTags("Subscription")
    @Post('update-contacts-in-subscription')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateUserinExistingSubscription(
        @Body() purchasePlanDto: updateSubscriptionPlanDto,
        @Req() req,
        @Res() res,
        @Query() subscriptionPlanId: string = "",
    ) {
        const response = await this.subscriptionService.updateUserinExistingSubscription(req, res, subscriptionPlanId, purchasePlanDto);
        res.send(response);
    };


    @ApiTags("Subscription")
    @Post('delete-subscribed-number')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async deleteSubscribedNumber(
        @Body() deleteSubscribedNumberDto: deleteSubscribedNumberDto,
        @Req() req,
        @Res() res,
    ) {
        const response = await this.subscriptionService.deleteSubscribedNumber(req.body, res);
        res.send(response);
    };

}
