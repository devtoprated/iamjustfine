import { Body, Controller, Post, Res, Headers, UseGuards, Patch, Get, Query, Req, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InvitationDto } from 'src/dto/invitation/create-invitation.dto';
import { SearchContactsDto } from 'src/dto/invitation/search-contact.dto';
import { InvitationListDto } from 'src/dto/invitation/invite-list.dto';
import { UpdateInvitationDto } from 'src/dto/invitation/update-invitation.dto';
import { DashboardDto } from 'src/dto/invitation/dashboard.dto';

@Controller('invitation')
export class InvitationController {

    constructor(
        private invitationService: InvitationService
    ) { }

    @ApiTags('Search')
    @Get('search-contact')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBearerAuth()
    async serachContact(@Query() searchContactsDto: SearchContactsDto, @Req() req, @Res() res) {
        const response = await this.invitationService.searchContacts(searchContactsDto, res, req.user);
        res.send(response)
    }

    @ApiTags('Invitation')
    @Post('invite-user')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBearerAuth()
    async inviteUser(@Body() invitationDto: InvitationDto, @Req() req, @Res() res) {
        const response = await this.invitationService.inviteUser(invitationDto, res, req.user);
        res.send(response)
    }


    @ApiTags('Invitation')
    @Post('get-request')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    @ApiBearerAuth()
    async getRequestList(@Body() invitationListDto: InvitationListDto, @Req() req, @Res() res) {
        const response = await this.invitationService.getRequestList(invitationListDto, res, req.user);
        res.send(response)
    }


    @ApiTags('Invitation')
    @Post('update-status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async updateStatus(@Body() updateStatusDto: UpdateInvitationDto, @Req() req, @Res() res) {
        const response = await this.invitationService.updateStatus(updateStatusDto, res, req.user);
        res.send(response)
    }

    @ApiTags('dashboard')
    @Post('dashboard')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOkResponse({ status: 200 })
    async dashboardList(@Body() dashboardDto: DashboardDto, @Req() req, @Res() res) {
        const response = await this.invitationService.dashboardList(dashboardDto, res, req.user);
        res.send(response)
    }
}
