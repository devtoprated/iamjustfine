import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
import { Subscription } from './subscription.entity';
import { MultipleUserSubscription } from './multipleUserSubscription.entity';
export declare class Plans extends SharedEntity {
    id: string;
    length: 6;
    stripePlanId: string;
    type: string;
    price: string;
    duration: string;
    status: string;
    columnOrder: string;
    dateCreation: string;
    user: Users;
    subscriptions: Subscription[];
    multiUserSubscription: MultipleUserSubscription[];
}
