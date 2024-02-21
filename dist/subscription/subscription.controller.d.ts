import { SubscriptionService } from './subscription.service';
import { purchasePlanDto } from '.././dto/subscription/subscription.dto';
import { updateSubscriptionPlanDto } from 'src/dto/subscription/updateSubscriptionPlan.dto';
import { deleteSubscribedNumberDto } from 'src/dto/subscription/deleteSubscribedNumber.dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    subscriptionPlanList(req: any, res: any): Promise<void>;
    updateStatus(purchasePlanDto: purchasePlanDto, req: any, res: any, err: any): Promise<void>;
    cancelSubscriptionPlan(req: any, res: any, subscriptionId?: string): Promise<void>;
    updateUserSubscriptionPlan(purchasePlanDto: updateSubscriptionPlanDto, req: any, res: any, subscriptionPlanId?: string): Promise<void>;
    updateUserinExistingSubscription(purchasePlanDto: updateSubscriptionPlanDto, req: any, res: any, subscriptionPlanId?: string): Promise<void>;
    deleteSubscribedNumber(deleteSubscribedNumberDto: deleteSubscribedNumberDto, req: any, res: any): Promise<void>;
}
