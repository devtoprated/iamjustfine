import {
  Controller,
  Get
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiHeader({
  name: 'userrole',
  description: 'User Role',
})

export class AppController {
  constructor(
    private appService: AppService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
