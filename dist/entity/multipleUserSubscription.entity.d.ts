import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
import { Subscription } from './subscription.entity';
import { Plans } from './plans.entity';
export declare class MultipleUserSubscription extends SharedEntity {
    userId: string;
    planId: string;
    subscriptionId: string;
    contactNumber: string;
    dialCode: string;
    subscription: Subscription;
    user: Users;
    plan: Plans;
}
