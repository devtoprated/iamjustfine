import { Controller, Request, Response, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/users/login.dto';
import { Brackets, Connection, In, Not, Repository } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';

@Controller()
export class AuthController {
    constructor(private authService: AuthService,
        @InjectConnection() private readonly connection: Connection) {
    }

    @Post('auth/login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}