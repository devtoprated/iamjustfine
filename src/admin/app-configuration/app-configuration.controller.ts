import { Body, Controller, Get, Post, Render, Req, Res, Request, NotFoundException, HttpStatus, Param, Put } from '@nestjs/common';
import { AppConfigurationService } from 'src/admin/app-configuration/app-configuration.service';

@Controller()
export class AppConfigurationController {

    constructor(private appConfigurationService: AppConfigurationService) { }

    @Get('admin/configuration/list')
    async configurationDetail(@Req() req, @Res() res) {
        try {
            await this.checkSessionHandled(req, res);

            let configurationRecord = await this.appConfigurationService.findConfigurations()

            return res.render('./admin/configurations/index', {
                session: req.session,
                siteTitle: 'Configuration',
                nodeSiteUrl: process.env.NODE_SITE_URL,
                nodeAdminUrl: process.env.NODE_ADMIN_URL,
                srcData: JSON.stringify(configurationRecord)
            });
        } catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred in configuration data table.' });
        }
    }

    @Get('admin/edit/configuration/:editId')
    async editConfiguration(@Param('editId') editId: string, @Req() req, @Res() res) {
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
        } catch (err) {
            console.log("edit configuration error", err)
        }
    }

    @Put('admin/update/configuration/:recordId')
    async updateConfiguration(@Param('recordId') recordId: string, @Req() req, @Res() res) {
        try {
            const recordExist = await this.appConfigurationService.getConfigById(recordId);

            if (!recordExist) {
                return res.status(HttpStatus.NOT_FOUND).json({ error: 'Configuration does not exist' });
            }

            const updatedUser = await this.appConfigurationService.updateRecord(recordExist, req.body);

            return res.status(HttpStatus.OK)
                .json({
                    "status": true,
                    "message": 'Configuration updated successfully'
                });

        } catch (err) {
            console.error("Error while updating configuration", err);
        }
    }


    // view  conf 
    @Get('admin/views/configuration/:recordId')
    async viewsuser(@Param('recordId') recordId: string, @Req() req, @Res() res) {
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
        } catch (err) {
            console.error(err);
            return res.render('error', { errorMessage: 'An error occurred.' });
        }
    }

    // Check if the user is logged in or not
    checkSessionHandled(req, res) {
        const isLoggedIn = req.session.user;
        if (!isLoggedIn) {
            return res.redirect('/api/admin/LoginPanel');
        }
    }
}



