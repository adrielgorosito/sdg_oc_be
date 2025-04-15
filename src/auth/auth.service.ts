import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { UserService } from 'src/user/user.service';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDTO) {
    try {
      const user = await this.userService.findOneWithPassword(
        signInDto.username,
      );

      const encryptedPassword = createHash('sha256')
        .update(signInDto.password)
        .digest('hex');

      if (user?.password !== encryptedPassword) {
        throw new UnauthorizedException();
      }

      const payload = {
        username: signInDto.username,
        role: user.role,
        sub: user.id,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al iniciar sesión: ' + error,
      );
    }
  }

  async signUp(signUpDto: SignUpDTO) {
    try {
      const encryptedPassword = createHash('sha256')
        .update(signUpDto.password)
        .digest('hex');

      Object.assign(signUpDto, { password: encryptedPassword });
      const payload = await this.userService.registerUser(signUpDto);

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al registrar el usuario: ' + error,
      );
    }
  }
}
