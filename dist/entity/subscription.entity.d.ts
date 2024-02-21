import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
import { MultipleUserSubscription } from './multipleUserSubscription.entity';
import { Plans } from './plans.entity';
export declare class Subscription extends SharedEntity {
    userId: string;
    planId: string;
    type: string;
    status: string;
    dateCreation: string;
    stripeSubscriptionPlanId: string;
    user: Users;
    multisubscription: MultipleUserSubscription[];
    plan: Plans;
}
