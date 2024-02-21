import { Repository } from 'typeorm';
import { Subscription } from 'src/entity/subscription.entity';
import { Plans } from 'src/entity/plans.entity';
import { StripeService } from 'src/utilities/stripe.service';
import { Users } from 'src/entity/user.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { updateSubscriptionPlanDto } from 'src/dto/subscription/updateSubscriptionPlan.dto';
export declare class SubscriptionService {
    private subscriptionRepository;
    private PlansRepository;
    private UsersRepository;
    private multiSubscriptionUsersRepository;
    private readonly stripeService;
    constructor(subscriptionRepository: Repository<Subscription>, PlansRepository: Repository<Plans>, UsersRepository: Repository<Users>, multiSubscriptionUsersRepository: Repository<MultipleUserSubscription>, stripeService: StripeService);
    subscriptionPlanList(res: any, user: any): Promise<unknown>;
    purchaseSubscription(req: any, res: any, user: any): Promise<unknown>;
    cancelSubscription(req: any, res: any, subscriptionId: any): Promise<unknown>;
    updateUserSubscriptionPlan(req: any, res: any, subscriptionPlanId: string, purchasePlanDto: updateSubscriptionPlanDto): Promise<unknown>;
    updateUserinExistingSubscription(req: any, res: any, subscriptionId: any, purchasePlanDto: updateSubscriptionPlanDto): Promise<unknown>;
    deleteSubscribedNumber(body: any, res: any): Promise<{
        status: boolean;
        message: string;
        result: string;
    }>;
}
