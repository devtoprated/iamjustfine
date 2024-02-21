import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Users } from '../../src/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { error } from 'console';

@Injectable()
export class EmailService {

    constructor(private mailerService: MailerService, private config: ConfigService) { }

    async sendUserWelcome(user: Users) {

        return await this.mailerService.sendMail({
            to: this.config.get('ADMIN_EMAIL'),
            from: this.config.get('MAIL_FROM'),
            subject: `I'm just fine account approval request - (${user.name})`,
            template: './approvalRequest', // `.ejs` extension is appended automatically
            context: {
                user
            }
        }).catch((err) => { console.log("error while sending email", err) });
    }
}
