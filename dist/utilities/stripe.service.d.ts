import { Stripe } from 'stripe';
import { Users } from 'src/entity/user.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { Repository } from 'typeorm';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { updateSubscriptionPlanDto } from 'src/dto/subscription/updateSubscriptionPlan.dto';
import { Plans } from 'src/entity/plans.entity';
export declare class StripeService {
    private readonly stripeKey;
    private UsersRepository;
    private multiUserSubscriptionRepository;
    private SubscriptionRepository;
    private planRepository;
    private stripe;
    constructor(stripeKey: string, UsersRepository: Repository<Users>, multiUserSubscriptionRepository: Repository<MultipleUserSubscription>, SubscriptionRepository: Repository<Subscription>, planRepository: Repository<Plans>);
    createPlan(planData: Stripe.PlanCreateParams): Promise<Stripe.Plan>;
    createCustomer(phone: string, metadata: object): Promise<Stripe.Customer>;
    createSession(planId: string, user: any, plan: any, DATA: any): Promise<Stripe.Checkout.Session>;
    handleSubscriptionWebhook(req: any, res: any, rawBody: any): Promise<void>;
    removeUserSubscriptionfromDb(subscriptionDeleted: Stripe.Subscription): Promise<void>;
    cancelUserSubscriptionPlan(isSubscriptionCheck: any): Promise<string | Stripe.Subscription>;
    updateUserPlan(alreadySubscribedStripePlanId: any, alreadySubscribedPlan: any, purchasePlanDto: updateSubscriptionPlanDto, loggedInUserId: string): Promise<string>;
}
