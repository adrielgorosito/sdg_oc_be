import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UserService } from 'src/user/user.service';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';

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

      const encryptedPassword = crypto
        .createHash('sha256')
        .update(signInDto.password)
        .digest('hex');

      if (user?.password !== encryptedPassword) {
        throw new UnauthorizedException();
      }
      // The "sub" (subject) claim identifies the principal that is the subject of the JWT
      const payload = { username: signInDto.username, sub: user.id };
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
      const encryptedPassword = crypto
        .createHash('sha256')
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
