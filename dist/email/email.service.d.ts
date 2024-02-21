import { MailerService } from '@nestjs-modules/mailer';
import { Users } from '../../src/entity/user.entity';
import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private mailerService;
    private config;
    constructor(mailerService: MailerService, config: ConfigService);
    sendUserWelcome(user: Users): Promise<any>;
}
