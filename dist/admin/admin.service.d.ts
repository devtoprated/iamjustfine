import { adminpanel } from 'src/entity/adminpanel.entity';
import { adminpanelDto } from 'src/dto/adminpanel/adminpanel.dto';
import { Repository } from 'typeorm';
import { Users } from 'src/entity/user.entity';
import { EditProfileDto } from 'src/dto/users/edit-profile.dto';
import { addUserDto } from 'src/dto/users/add-user.dto';
import { Invitation } from 'src/entity/invitation.entity';
import { Plans } from 'src/entity/plans.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { StripeService } from '../utilities/stripe.service';
export declare class AdminService {
    private adminpanelRepository;
    private userRespository;
    private plansRespository;
    private invitationRespository;
    private SubscriptionRespository;
    private MultipleUserSubscriptionRespository;
    private readonly stripeService;
    constructor(adminpanelRepository: Repository<adminpanel>, userRespository: Repository<Users>, plansRespository: Repository<Plans>, invitationRespository: Repository<Invitation>, SubscriptionRespository: Repository<Subscription>, MultipleUserSubscriptionRespository: Repository<MultipleUserSubscription>, stripeService: StripeService);
    validateadmin(username: string, password: string): Promise<adminpanel>;
    adminpanel(adminpanelDto: adminpanelDto, res: any): Promise<unknown>;
    getAllUsers(): Promise<Users[]>;
    getAllUsers1(): Promise<Users[]>;
    userData(userId: string): Promise<Users>;
    viewsuser(userId: string): Promise<Users>;
    followinglist(userId: string): Promise<Users>;
    getUserById(userId: string): Promise<Users>;
    deleteuser(userid: string): Promise<unknown>;
    isPhoneNumberUnique(phoneNumber: string): Promise<boolean>;
    updateUser(userId: string, EditProfileDto: EditProfileDto): Promise<Users>;
    saveFollowersList(data: any): Promise<any>;
    addUser(addUserDto: addUserDto, res: any): Promise<{
        status: boolean;
        message: string;
        result: Users;
        error?: undefined;
    } | {
        status: boolean;
        error: string;
        message?: undefined;
        result?: undefined;
    }>;
    updateUserData(req: any, res: any): Promise<any>;
    processUserFile(file: any): Promise<string>;
    addSubscriptionPlan(data: any, res: any): Promise<{
        status: boolean;
        message: string;
        result: Plans;
        error?: undefined;
    } | {
        status: boolean;
        error: string;
        message?: undefined;
        result?: undefined;
    }>;
    getAllSubscriptionPlans(): Promise<Plans[]>;
    planData(planId: string): Promise<Plans>;
    updateSubscriptionPlan(planId: string, data: any): Promise<Plans>;
    viewPlan(userId: string): Promise<Plans>;
    deletePlan(planId: string): Promise<unknown>;
}
