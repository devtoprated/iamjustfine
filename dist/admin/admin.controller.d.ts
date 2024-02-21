import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { adminpanelDto } from 'src/dto/adminpanel/adminpanel.dto';
import { EditProfileDto } from 'src/dto/users/edit-profile.dto';
import { addUserDto } from 'src/dto/users/add-user.dto';
import { Plans } from 'src/entity/plans.entity';
import { Repository } from 'typeorm';
export declare class AdminController {
    private adminservice;
    private userService;
    private PlansRespository;
    constructor(adminservice: AdminService, userService: UsersService, PlansRespository: Repository<Plans>);
    loginejs(): {};
    getdashboard(req: any, res: any, err: any): Promise<any>;
    validate(req: any, res: any, adminpanelDto: adminpanelDto): Promise<any>;
    logout(req: any, res: any): Promise<void>;
    getuser(req: any, res: any, err: any): Promise<any>;
    adminpanel(adminpanelDto: adminpanelDto, res: any): Promise<void>;
    getEditUserPage(userId: string, req: any, res: any): Promise<void>;
    deleteUser(userId: string, req: any, res: any): Promise<any>;
    viewsuser(userId: string, req: any, res: any): Promise<any>;
    followinglist(userId: string, req: any, res: any): Promise<any>;
    saveFollowers(data: any): Promise<{
        status: boolean;
        message: string;
        data: any;
        error?: undefined;
    } | {
        status: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    updateUser(userId: string, EditProfileDto: EditProfileDto, req: any, res: any): Promise<any>;
    addUser(addUserDto: addUserDto, res: any, req: any): Promise<any>;
    catch(e: any): void;
    updateUserStatus(req: any, res: any): Promise<void>;
    uploadFile(file: Express.Multer.File): Promise<{
        message: string;
    }>;
    downloadCsv(res: any): void;
    checkSessionHandled(req: any, res: any): any;
    getSubscriptionPlans(req: any, res: any, err: any): Promise<any>;
    addSubscriptionPlan(req: any, res: any, err: any): Promise<any>;
    getEditSubscriptionPlan(planId: string, req: any, res: any): Promise<void>;
    updateSubscriptionPlan(planId: string, req: any, res: any): Promise<any>;
    viewPlan(planId: string, req: any, res: any): Promise<any>;
    deletePlan(planId: string, req: any, res: any): Promise<any>;
}
