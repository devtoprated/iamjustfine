import { AuthService } from './auth.service';
import { LoginDto } from '../dto/users/login.dto';
import { Connection } from 'typeorm';
export declare class AuthController {
    private authService;
    private readonly connection;
    constructor(authService: AuthService, connection: Connection);
    login(loginDto: LoginDto): Promise<unknown>;
}
