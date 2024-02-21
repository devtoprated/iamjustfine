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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const users_service_1 = require("../users/users.service");
const adminpanel_dto_1 = require("../dto/adminpanel/adminpanel.dto");
const edit_profile_dto_1 = require("../dto/users/edit-profile.dto");
const platform_express_1 = require("@nestjs/platform-express");
const add_user_dto_1 = require("../dto/users/add-user.dto");
const multer_1 = require("multer");
const path_1 = require("path");
const plans_entity_1 = require("../entity/plans.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let AdminController = class AdminController {
    constructor(adminservice, userService, PlansRespository) {
        this.adminservice = adminservice;
        this.userService = userService;
        this.PlansRespository = PlansRespository;
    }
    loginejs() {
        return {};
    }
    async getdashboard(req, res, err) {
        const isLoggedIn = req.session.user;
        if (!isLoggedIn) {
            return res.redirect('/api/admin/LoginPanel');
        }
        const userCount = await this.userService.getUserCount();
        const subscriptionPlansCount = await this.PlansRespository.count();
        res.render('admin/dashboard', {
            siteTitle: 'Dashboard',
            nodeSiteUrl: process.env.NODE_SITE_URL,
            nodeAdminUrl: process.env.NODE_ADMIN_URL,
            data: { usercount: userCount, subscriptionPlansCount: subscriptionPlansCount },
            redirecttologs: "",
            adminToken: "",
            session: req.session
        });
    }
    async validate(req, res, adminpanelDto) {
        const { username, password } = adminpanelDto;
        const user = await this.adminservice.validateadmin(username, password);
        if (user) {
            req.session.user = user;
            return res.redirect('/api/admin/dashboard');
        }
        else {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/api/admin/LoginPanel');
        }
    }
    async logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/api/admin/LoginPanel');
        });
    }
    async getuser(req, res, err) {
        try {
            await this.checkSessionHandled(req, res);
            const srcData = await this.adminservice.getAllUsers();
            return res.render('./admin/userlist', {
                session: req.session,
                siteTitle: 'hello',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }
    async adminpanel(adminpanelDto, res) {
        const response = await this.adminservice.adminpanel(adminpanelDto, res);
        res.send(response);
    }
    async getEditUserPage(userId, req, res) {
        try {
            await this.checkSessionHandled(req, res);
            const srcData = await this.adminservice.userData(userId);
            res.render('./admin/edituser', {
                session: req.session,
                siteTitle: 'hello',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
            });
        }
        catch (error) {
            console.log({ error });
        }
    }
    async deleteUser(userId, req, res) {
        try {
            const deleteduser = await this.adminservice.deleteuser(userId);
            return res.status(common_1.HttpStatus.OK).json({ message: "User deleted successfully", user: deleteduser });
        }
        catch (err) {
            console.error(err);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ errorMessage: 'An error occurred.' });
        }
    }
    async viewsuser(userId, req, res) {
        try {
            await this.checkSessionHandled(req, res);
            const srcData = await this.adminservice.viewsuser(userId);
            return res.render('./admin/viewuser', {
                session: req.session,
                siteTitle: 'viewuser',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }
    async followinglist(userId, req, res) {
        try {
            const allUsers = await this.adminservice.getAllUsers1();
            const srcData = await this.adminservice.followinglist(userId);
            return res.render('./admin/followinglist', {
                session: req.session,
                siteTitle: 'followinglist',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
                allUsers: JSON.stringify(allUsers),
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }
    async saveFollowers(data) {
        try {
            console.log('Received data:', data);
            const savedData = await this.adminservice.saveFollowersList(data);
            return { status: true, message: 'Followers add  saved successfully', data: savedData };
        }
        catch (error) {
            console.error('Error saving followers list:', error);
            return { status: false, message: 'Error saving data', error: error.message };
        }
    }
    async updateUser(userId, EditProfileDto, req, res) {
        try {
            const currentUser = await this.adminservice.getUserById(userId);
            if (!currentUser) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({ error: 'User not found' });
            }
            if (EditProfileDto.contactNumber !== currentUser.contactNumber) {
                const isUnique = await this.adminservice.isPhoneNumberUnique(EditProfileDto.contactNumber);
                if (!isUnique) {
                    return res.status(common_1.HttpStatus.BAD_REQUEST).json({ error: 'Phone number already exists' });
                }
            }
            const updatedUser = await this.adminservice.updateUser(userId, EditProfileDto);
            return res.status(common_1.HttpStatus.OK).json({ message: 'User updated successfully', user: updatedUser });
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException) {
                throw e;
            }
            console.error(e);
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async addUser(addUserDto, res, req) {
        const isLoggedIn = req.session.user;
        const response = await this.adminservice.addUser(addUserDto, res);
        return res.status(common_1.HttpStatus.OK).json({ message: 'User created  successfully', user: response });
    }
    catch(e) {
        if (e instanceof common_1.NotFoundException) {
            throw e;
        }
        console.error(e);
        throw new common_1.InternalServerErrorException('Error updating user');
    }
    async updateUserStatus(req, res) {
        const response = await this.adminservice.updateUserData(req, res);
        res.send(response);
    }
    async uploadFile(file) {
        try {
            const result = await this.adminservice.processUserFile(file);
            return { message: result };
        }
        catch (error) {
            return { message: 'Error while uploading CSV file, please verify csv data again.' };
        }
    }
    downloadCsv(res) {
        const csvFilePath = `${process.cwd()}/public/demo/demo.csv`;
        res.download(csvFilePath, 'demo.csv');
    }
    checkSessionHandled(req, res) {
        const isLoggedIn = req.session.user;
        if (!isLoggedIn) {
            return res.redirect('/api/admin/LoginPanel');
        }
    }
    async getSubscriptionPlans(req, res, err) {
        try {
            await this.checkSessionHandled(req, res);
            const srcData = await this.adminservice.getAllSubscriptionPlans();
            return res.render('./admin/subscriptionlist', {
                session: req.session,
                siteTitle: 'hello',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }
    async addSubscriptionPlan(req, res, err) {
        try {
            await this.checkSessionHandled(req, res);
            let data = req.body;
            console.log(data, "+================================ data ");
            const isLoggedIn = req.session.user;
            const response = await this.adminservice.addSubscriptionPlan(data, res);
            return res.status(common_1.HttpStatus.OK).json({ message: 'Plan created  successfully', user: response });
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException) {
                throw e;
            }
            console.error(e);
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async getEditSubscriptionPlan(planId, req, res) {
        try {
            await this.checkSessionHandled(req, res);
            const srcData = await this.adminservice.planData(planId);
            res.render('./admin/editSubscriptionPlan', {
                session: req.session,
                siteTitle: 'hello',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
            });
        }
        catch (error) {
            console.log({ error });
        }
    }
    async updateSubscriptionPlan(planId, req, res) {
        try {
            let data = req.body;
            const updatedUser = await this.adminservice.updateSubscriptionPlan(planId, data);
            return res.status(common_1.HttpStatus.OK).json({ message: 'User updated successfully', user: updatedUser });
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException) {
                throw e;
            }
            console.error(e);
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async viewPlan(planId, req, res) {
        try {
            await this.checkSessionHandled(req, res);
            const srcData = await this.adminservice.viewPlan(planId);
            return res.render('./admin/viewPlan', {
                session: req.session,
                siteTitle: 'viewPlan',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
            });
        }
        catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }
    async deletePlan(planId, req, res) {
        try {
            const deleteduser = await this.adminservice.deletePlan(planId);
            return res.status(common_1.HttpStatus.OK).json({ message: "User deleted successfully", user: deleteduser });
        }
        catch (err) {
            console.error(err);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ errorMessage: 'An error occurred.' });
        }
    }
};
__decorate([
    (0, common_1.Get)('/admin/loginPanel'),
    (0, common_1.Render)('./admin/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "loginejs", null);
__decorate([
    (0, common_1.Get)('/admin/dashboard'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getdashboard", null);
__decorate([
    (0, common_1.Post)('/admin/Login'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, adminpanel_dto_1.adminpanelDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('admin/logout'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('admin/userlist'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getuser", null);
__decorate([
    (0, common_1.Post)('admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adminpanel_dto_1.adminpanelDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminpanel", null);
__decorate([
    (0, common_1.Get)('admin/edituser/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEditUserPage", null);
__decorate([
    (0, common_1.Delete)('admin/users:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('admin/views:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewsuser", null);
__decorate([
    (0, common_1.Get)('superAdmin/following:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "followinglist", null);
__decorate([
    (0, common_1.Post)('superAdmin/savefollowwers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "saveFollowers", null);
__decorate([
    (0, common_1.Put)('admin/userIds/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, edit_profile_dto_1.EditProfileDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)('admin/add/user'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_user_dto_1.addUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('admin/update/user/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Post)('admin/csv/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('admin/download/demo/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "downloadCsv", null);
__decorate([
    (0, common_1.Get)('admin/getSubscriptionPlans'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubscriptionPlans", null);
__decorate([
    (0, common_1.Post)('admin/addSubscriptionPlan'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addSubscriptionPlan", null);
__decorate([
    (0, common_1.Get)('admin/getEditSubscriptionPlan/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEditSubscriptionPlan", null);
__decorate([
    (0, common_1.Put)('admin/updateSubscriptionPlan/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSubscriptionPlan", null);
__decorate([
    (0, common_1.Get)('admin/viewPlan/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewPlan", null);
__decorate([
    (0, common_1.Delete)('admin/deletePlan/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePlan", null);
AdminController = __decorate([
    (0, common_1.Controller)(),
    __param(2, (0, typeorm_1.InjectRepository)(plans_entity_1.Plans)),
    __metadata("design:paramtypes", [admin_service_1.AdminService, users_service_1.UsersService,
        typeorm_2.Repository])
], AdminController);
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map