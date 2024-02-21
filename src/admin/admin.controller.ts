import { Body, Controller, Get, Post, Render, Req, Res, Request, Param, Delete, Put, InternalServerErrorException, NotFoundException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { adminpanelDto } from 'src/dto/adminpanel/adminpanel.dto';
import session from 'express-session';
import { EditProfileDto } from 'src/dto/users/edit-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { addUserDto } from 'src/dto/users/add-user.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Plans } from 'src/entity/plans.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';


@Controller()
export class AdminController {

    constructor(
        
        private adminservice: AdminService, private userService: UsersService,
        
        @InjectRepository(Plans)
        private PlansRespository: Repository<Plans>,

        ) { }

    @Get('/admin/loginPanel')
    @Render('./admin/login')
    loginejs() {
        return {};
    }

    @Get('/admin/dashboard')
    async getdashboard(@Req() req, @Res() res, err) {
        const isLoggedIn = req.session.user; // Check if the user is logged in
        if (!isLoggedIn) {
            return res.redirect('/api/admin/LoginPanel'); // Redirect to the login page if not logged in
        }

        const userCount = await this.userService.getUserCount();

        const subscriptionPlansCount = await this.PlansRespository.count();

        res.render('admin/dashboard', {
            siteTitle: 'Dashboard',
            nodeSiteUrl: process.env.NODE_SITE_URL,
            nodeAdminUrl: process.env.NODE_ADMIN_URL,
            data: { usercount: userCount,subscriptionPlansCount:subscriptionPlansCount },
            redirecttologs: "",
            adminToken: "",
            session: req.session
        });
    }

    @Post('/admin/Login')
    async validate(@Request() req, @Res() res, @Body() adminpanelDto: adminpanelDto) {
        const { username, password } = adminpanelDto;
        const user = await this.adminservice.validateadmin(username, password);

        // console.log({ user })

        if (user) {
            req.session.user = user;
            return res.redirect('/api/admin/dashboard');
        } else {
            req.flash('error', 'Invalid username or password'); // Set an error flash message
            return res.redirect('/api/admin/LoginPanel');
        }
    }

    @Get('admin/logout')
    async logout(@Request() req, @Res() res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/api/admin/LoginPanel');
        });


    }
    // get the api user record in datatable format 
    @Get('admin/userlist')
    async getuser(@Req() req, @Res() res, err) {
        try {

            await this.checkSessionHandled(req, res);

            const srcData = await this.adminservice.getAllUsers();
            return res.render('./admin/userlist', {
                session: req.session,
                siteTitle: 'hello',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData), // Pass the srcData to the view as a JSON string
            });
        } catch (err) {
            // Handle error
            console.error(err);
            // Render an error view or return an error response
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }

    // post api admin user
    @Post('admin')
    async adminpanel(@Body() adminpanelDto: adminpanelDto, @Res() res) {
        const response = await this.adminservice.adminpanel(adminpanelDto, res);
        res.send(response);
    }


    // Edit User Page  behalf UserId
    @Get('admin/edituser/:userId')
    async getEditUserPage(@Param('userId') userId: string, @Req() req, @Res() res) {
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
        } catch (error) {
            console.log({ error })
        }
    }

    // Delete user Id and redirect userlist page 
    @Delete('admin/users:userId')
    async deleteUser(@Param('userId') userId: string, @Req() req, @Res() res) {
        try {
            const deleteduser = await this.adminservice.deleteuser(userId);
            return res.status(HttpStatus.OK).json({ message: "User deleted successfully", user: deleteduser });
        } catch (err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ errorMessage: 'An error occurred.' });
        }
    }


    // view user api get 
    @Get('admin/views:userId')
    async viewsuser(@Param('userId') userId: string, @Req() req, @Res() res) {
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
        } catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }

    @Get('superAdmin/following:userId')
    async followinglist(@Param('userId') userId: string, @Req() req, @Res() res) {
        try {
            const allUsers = await this.adminservice.getAllUsers1(); // Fetch all users from the database
            const srcData = await this.adminservice.followinglist(userId);

            return res.render('./admin/followinglist', {
                session: req.session,
                siteTitle: 'followinglist',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData),
                allUsers: JSON.stringify(allUsers),
            });
        } catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }

    @Post('superAdmin/savefollowwers')
    async saveFollowers(@Body() data: any) {
        try {
            console.log('Received data:', data);
            // Call the service to save the followers list data to the database
            const savedData = await this.adminservice.saveFollowersList(data);
            return { status: true, message: 'Followers add  saved successfully', data: savedData };
        } catch (error) {
            console.error('Error saving followers list:', error);
            return { status: false, message: 'Error saving data', error: error.message };
        }
    }


    //update the user record in edit user api
    @Put('admin/userIds/:userId')
    async updateUser(@Param('userId') userId: string, @Body() EditProfileDto: EditProfileDto, @Req() req, @Res() res) {
        try {
            const currentUser = await this.adminservice.getUserById(userId);

            if (!currentUser) {
                // User not found, return error
                return res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
            }

            // Check if the edited phone number is different from the current phone number
            if (EditProfileDto.contactNumber !== currentUser.contactNumber) {
                // Check if the edited phone number is unique
                const isUnique = await this.adminservice.isPhoneNumberUnique(EditProfileDto.contactNumber);
                if (!isUnique) {
                    // Phone number is not unique, return error
                    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Phone number already exists' });
                }
            }
            const updatedUser = await this.adminservice.updateUser(userId, EditProfileDto);
            return res.status(HttpStatus.OK).json({ message: 'User updated successfully', user: updatedUser });
        } catch (e) {
            if (e instanceof NotFoundException) {
                throw e; // Rethrow NotFoundException if the user is not found
            }
            console.error(e);
            throw new InternalServerErrorException('Error updating user');
        }
    }


    @Post('admin/add/user')
    async addUser(@Body() addUserDto: addUserDto, @Res() res, @Req() req) {
        const isLoggedIn = req.session.user;
        const response = await this.adminservice.addUser(addUserDto, res);
        return res.status(HttpStatus.OK).json({ message: 'User created  successfully', user: response });
    } catch(e) {
        if (e instanceof NotFoundException) {
            throw e;
        }
        console.error(e);
        throw new InternalServerErrorException('Error updating user');
    }


    @Post('admin/update/user/status')
    async updateUserStatus(@Req() req, @Res() res) {
        const response = await this.adminservice.updateUserData(req, res);
        res.send(response);
    }
    @Post('admin/csv/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        try {
            const result = await this.adminservice.processUserFile(file);
            return { message: result };
        } catch (error) {
            return { message: 'Error while uploading CSV file, please verify csv data again.' };

        }
    }

    @Get('admin/download/demo/csv')
    downloadCsv(@Res() res) {
        const csvFilePath = `${process.cwd()}/public/demo/demo.csv`
        res.download(csvFilePath, 'demo.csv');
    }

    checkSessionHandled(req, res) {
        const isLoggedIn = req.session.user; // Check if the user is logged in

        if (!isLoggedIn) {
            return res.redirect('/api/admin/LoginPanel'); // Redirect to the login page if not logged in
        }
    }



    @Get('admin/getSubscriptionPlans')
    async getSubscriptionPlans(@Req() req, @Res() res, err) {
        try {
            await this.checkSessionHandled(req, res);

            const srcData = await this.adminservice.getAllSubscriptionPlans();

            return res.render('./admin/subscriptionlist', {
                session: req.session,
                siteTitle: 'hello',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(srcData), // Pass the srcData to the view as a JSON string
            });


        } catch (err) {
            // Handle error
            console.error(err);
            // Render an error view or return an error response
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }


    @Post('admin/addSubscriptionPlan')
    async addSubscriptionPlan(@Req() req, @Res() res, err) {
        try {
            await this.checkSessionHandled(req, res);

            let data = req.body

            console.log(data,"+================================ data ")
            const isLoggedIn = req.session.user;
            const response = await this.adminservice.addSubscriptionPlan(data, res);
            return res.status(HttpStatus.OK).json({ message: 'Plan created  successfully', user: response });
        } catch (e) {
            if (e instanceof NotFoundException) {
                throw e;
            }
            console.error(e);
            throw new InternalServerErrorException('Error updating user');
        }
    }

    @Get('admin/getEditSubscriptionPlan/:planId')
    async getEditSubscriptionPlan(@Param('planId') planId: string, @Req() req, @Res() res) {
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

        } catch (error) {
            console.log({ error })
        }
    }

    @Put('admin/updateSubscriptionPlan/:planId')
    async updateSubscriptionPlan(@Param('planId') planId: string, @Req() req, @Res() res) {
        try {
            let data = req.body

            const updatedUser = await this.adminservice.updateSubscriptionPlan(planId, data);

            return res.status(HttpStatus.OK).json({ message: 'User updated successfully', user: updatedUser });
        } catch (e) {
            if (e instanceof NotFoundException) {
                throw e; // Rethrow NotFoundException if the user is not found
            }
            console.error(e);
            throw new InternalServerErrorException('Error updating user');
        }
    }

    @Get('admin/viewPlan/:planId')
    async viewPlan(@Param('planId') planId: string, @Req() req, @Res() res) {
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

        } catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }

    @Delete('admin/deletePlan/:planId')
    async deletePlan(@Param('planId') planId: string, @Req() req, @Res() res) {
        try {
            const deleteduser = await this.adminservice.deletePlan(planId);
            return res.status(HttpStatus.OK).json({ message: "User deleted successfully", user: deleteduser });
        } catch (err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ errorMessage: 'An error occurred.' });
        }
    }

}



