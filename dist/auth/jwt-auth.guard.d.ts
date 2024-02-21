import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from 'src/entity/user-token.entity';
import { Repository } from 'typeorm';
export declare class JwtAuthGuard implements CanActivate {
    private jwtService;
    private userTokenRepository;
    constructor(jwtService: JwtService, userTokenRepository: Repository<UserToken>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
