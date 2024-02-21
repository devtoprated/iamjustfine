import { Repository } from 'typeorm';
import { Subscription } from 'src/entity/subscription.entity';
import { UserToken } from 'src/entity/user-token.entity';
import { Plans } from 'src/entity/plans.entity';
import { StripeService } from 'src/utilities/stripe.service';
import { Users } from 'src/entity/user.entity';
export declare class WebhookService {
    private subscriptionRepository;
    private userTokenRepository;
    private PlansRepository;
    private UsersRepository;
    private readonly stripeService;
    constructor(subscriptionRepository: Repository<Subscription>, userTokenRepository: Repository<UserToken>, PlansRepository: Repository<Plans>, UsersRepository: Repository<Users>, stripeService: StripeService);
    handleSubscriptionWebhook(req: any, res: any, rawBody: any): Promise<unknown>;
}
