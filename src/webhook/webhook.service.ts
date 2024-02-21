import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';

import { Brackets, Connection, In, Not, Repository } from 'typeorm';
import { Subscription } from 'src/entity/subscription.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { Plans } from 'src/entity/plans.entity';
import { StripeService } from 'src/utilities/stripe.service';
import { Users } from 'src/entity/user.entity';


@Injectable()
export class WebhookService {

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,

        @InjectRepository(UserToken)
        private userTokenRepository: Repository<UserToken>,

        @InjectRepository(Plans)
        private PlansRepository: Repository<Plans>,

        @InjectRepository(Users)
        private UsersRepository: Repository<Users>,

        private readonly stripeService: StripeService,
    ) { }

    async handleSubscriptionWebhook(req, res,rawBody) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.stripeService.handleSubscriptionWebhook(req, res,rawBody)

            } catch (err) {
                console.log(err);
                reject({
                    status: false,
                    error: ` ${err}  Error, please check server logs for more information...`,
                });
            }

        })

    }
}
