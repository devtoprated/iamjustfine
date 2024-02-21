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
exports.AppConfigurationController = void 0;
const common_1 = require("@nestjs/common");
const app_configuration_service_1 = require("./app-configuration.service");
let AppConfigurationController = class AppConfigurationController {
    constructor(appConfigurationService) {
        this.appConfigurationService = appConfigurationService;
    }
    async configurationDetail(req, res) {
        try {
            await this.checkSessionHandled(req, res);
            let configurationRecord = await this.appConfigurationService.findConfigurations();
            return res.render('./admin/configurations/index', {
                session: req.session,
                siteTitle: 'Configuration',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(configurationRecord)
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred in configuration data table.' });
        }
    }
    async editConfiguration(editId, req, res) {
        try {
            await this.checkSessionHandled(req, res);
            let record = await this.appConfigurationService.getConfigById(editId);
            return res.render('./admin/configurations/edit', {
                session: req.session,
                siteTitle: 'Edit Configuration',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: record
            });
        }
        catch (err) {
            console.log("edit configuration error", err);
        }
    }
    async updateConfiguration(recordId, req, res) {
        try {
            const recordExist = await this.appConfigurationService.getConfigById(recordId);
            if (!recordExist) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({ error: 'Configuration does not exist' });
            }
            const updatedUser = await this.appConfigurationService.updateRecord(recordExist, req.body);
            return res.status(common_1.HttpStatus.OK)
                .json({
                "status": true,
                "message": 'Configuration updated successfully'
            });
        }
        catch (err) {
            console.error("Error while updating configuration", err);
        }
    }
    async viewsuser(recordId, req, res) {
        try {
            await this.checkSessionHandled(req, res);
            const record = await this.appConfigurationService.getConfigById(recordId);
            return res.render('./admin/configurations/show', {
                session: req.session,
                siteTitle: 'View Configuration',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: record,
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }
    checkSessionHandled(req, res) {
        const isLoggedIn = req.session.user;
        if (!isLoggedIn) {
            return res.redirect('/api/admin/LoginPanel');
        }
    }
};
__decorate([
    (0, common_1.Get)('admin/configuration/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppConfigurationController.prototype, "configurationDetail", null);
__decorate([
    (0, common_1.Get)('admin/edit/configuration/:editId'),
    __param(0, (0, common_1.Param)('editId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AppConfigurationController.prototype, "editConfiguration", null);
__decorate([
    (0, common_1.Put)('admin/update/configuration/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AppConfigurationController.prototype, "updateConfiguration", null);
__decorate([
    (0, common_1.Get)('admin/views/configuration/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AppConfigurationController.prototype, "viewsuser", null);
AppConfigurationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_configuration_service_1.AppConfigurationService])
], AppConfigurationController);
exports.AppConfigurationController = AppConfigurationController;
//# sourceMappingURL=app-configuration.controller.js.map