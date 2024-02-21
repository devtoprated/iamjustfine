"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invitation_service_1 = require("./invitation.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_invitation_dto_1 = require("../dto/invitation/create-invitation.dto");
const search_contact_dto_1 = require("../dto/invitation/search-contact.dto");
const invite_list_dto_1 = require("../dto/invitation/invite-list.dto");
const update_invitation_dto_1 = require("../dto/invitation/update-invitation.dto");
const dashboard_dto_1 = require("../dto/invitation/dashboard.dto");
let InvitationController = class InvitationController {
    constructor(invitationService) {
        this.invitationService = invitationService;
    }
    async serachContact(searchContactsDto, req, res) {
        const response = await this.invitationService.searchContacts(searchContactsDto, res, req.user);
        res.send(response);
    }
    async inviteUser(invitationDto, req, res) {
        const response = await this.invitationService.inviteUser(invitationDto, res, req.user);
        res.send(response);
    }
    async getRequestList(invitationListDto, req, res) {
        const response = await this.invitationService.getRequestList(invitationListDto, res, req.user);
        res.send(response);
    }
    async updateStatus(updateStatusDto, req, res) {
        const response = await this.invitationService.updateStatus(updateStatusDto, res, req.user);
        res.send(response);
    }
    async dashboardList(dashboardDto, req, res) {
        const response = await this.invitationService.dashboardList(dashboardDto, res, req.user);
        res.send(response);
    }
};
__decorate([
    (0, swagger_1.ApiTags)('Search'),
    (0, common_1.Get)('search-contact'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_contact_dto_1.SearchContactsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "serachContact", null);
__decorate([
    (0, swagger_1.ApiTags)('Invitation'),
    (0, common_1.Post)('invite-user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invitation_dto_1.InvitationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "inviteUser", null);
__decorate([
    (0, swagger_1.ApiTags)('Invitation'),
    (0, common_1.Post)('get-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_list_dto_1.InvitationListDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getRequestList", null);
__decorate([
    (0, swagger_1.ApiTags)('Invitation'),
    (0, common_1.Post)('update-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_invitation_dto_1.UpdateInvitationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "updateStatus", null);
__decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Post)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "dashboardList", null);
InvitationController = __decorate([
    (0, common_1.Controller)('invitation'),
    __metadata("design:paramtypes", [invitation_service_1.InvitationService])
], InvitationController);
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitation.controller.js.map