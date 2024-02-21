import { Body, Controller, HttpCode, Req, Post, Res, UseGuards, UseInterceptors, HttpException, HttpStatus, UploadedFile, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { purchasePlanDto } from '.././dto/subscription/subscription.dto'
import * as bodyParser from 'body-parser';
import RequestWithRawBody from './requestWithRawBody.interface';



@Controller('webhook')
export class WebhookController {
    constructor(
        private webhookService: WebhookService
    ) { }

    @ApiTags('Webhook')
    @Post('handle-payment-webhook')

    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateStatus(@Req() request: RequestWithRawBody
        , @Res() res) {
        try {
            const response = this.webhookService.handleSubscriptionWebhook(request, res, request.rawBody);
            res.send(response);
        } catch (err) {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        }
    }
}
