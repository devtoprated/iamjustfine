import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class AppService {
  private readonly users: any[] = [];
  constructor(){}

  getHello(): string {
    return 'Hello World!';
  }


}
