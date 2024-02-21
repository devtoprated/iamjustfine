import { InvitationService } from './invitation.service';
import { InvitationDto } from 'src/dto/invitation/create-invitation.dto';
import { SearchContactsDto } from 'src/dto/invitation/search-contact.dto';
import { InvitationListDto } from 'src/dto/invitation/invite-list.dto';
import { UpdateInvitationDto } from 'src/dto/invitation/update-invitation.dto';
import { DashboardDto } from 'src/dto/invitation/dashboard.dto';
export declare class InvitationController {
    private invitationService;
    constructor(invitationService: InvitationService);
    serachContact(searchContactsDto: SearchContactsDto, req: any, res: any): Promise<void>;
    inviteUser(invitationDto: InvitationDto, req: any, res: any): Promise<void>;
    getRequestList(invitationListDto: InvitationListDto, req: any, res: any): Promise<void>;
    updateStatus(updateStatusDto: UpdateInvitationDto, req: any, res: any): Promise<void>;
    dashboardList(dashboardDto: DashboardDto, req: any, res: any): Promise<void>;
}
