import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/user.dto';

@Injectable()
export class UsersService {
  createUser(data: CreateUserDto) {
    console.log('data--->', data);
    return 'message';
  }
}
