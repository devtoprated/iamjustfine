import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { Invitation } from '../entity/invitation.entity';
import { NotificationService } from 'src/notification/notification.service';
export declare class InvitationService {
    private notificationService;
    private userRepository;
    private invitationRepository;
    constructor(notificationService: NotificationService, userRepository: Repository<Users>, invitationRepository: Repository<Invitation>);
    searchContacts(req: any, res: any, loginUser: any): Promise<unknown>;
    inviteUser(req: any, res: any, loginUser: any): Promise<unknown>;
    inviteExistingUser(isUserExist: any, invitedTo: any, loginUser: any, type: any): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    getRequestList(invitationListDto: any, req: any, loginUser: any): Promise<unknown>;
    updateStatus(req: any, res: any, loginUser: any): Promise<unknown>;
    dashboardList(req: any, res: any, loginUser: any): Promise<unknown>;
    getPendingRequest(type: any, loginUser: any): Promise<Invitation[]>;
}
