import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDTO } from 'src/auth/dto/signup.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
      select: { id: true, username: true, role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneWithPassword(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async registerUser(signUpDTO: SignUpDTO) {
    const existingUser = await this.userRepository.findOne({
      where: { username: signUpDTO.username },
    });

    if (existingUser) {
      throw new ConflictException('Usuario existente');
    }
    const user = await this.userRepository.save(signUpDTO);

    const payload = { username: user.username, role: user.role, sub: user.id };
    return payload;
  }
}
