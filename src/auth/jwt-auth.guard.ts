import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../config/jwt-constants';
import { Request } from 'express';
import { UserToken } from 'src/entity/user-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        @InjectRepository(UserToken)
        private userTokenRepository: Repository<UserToken>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            response.status(401).json({
                "statusCode": 401,
                "message": "Unauthorized",
                "result": {}
            })
            //throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );

            console.log({ payload })

            let userRecordExist = await this.userTokenRepository.findOne({
                where: {
                    token: token
                }
            })
            if (userRecordExist) {
                // 💡 We're assigning the payload to the request object here
                // so that we can access it in our route handlers
                request['user'] = payload;
            } else {
                response.status(401).json({
                    "statusCode": 401,
                    "message": "Unauthorized",
                    "result": {}
                })
            }

        } catch {
            response.status(401).json({
                "statusCode": 401,
                "message": "Unauthorized",
                "result": {}
            })

            // throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}