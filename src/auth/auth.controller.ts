import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async registration(@Body() signUpDto: SignUpDTO) {
    return await this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDTO) {
    return await this.authService.signIn(signInDto);
  }
}
