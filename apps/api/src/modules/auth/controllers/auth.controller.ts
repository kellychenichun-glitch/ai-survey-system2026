import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登入' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '登入成功',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Email 或密碼錯誤',
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      success: true,
      data: result,
    };
  }

  @Post('register')
  @ApiOperation({ summary: '註冊' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '註冊成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email 已被註冊',
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return {
      success: true,
      data: result,
      message: '註冊成功',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得當前使用者資訊' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功取得使用者資訊',
  })
  async getMe(@CurrentUser() user: User) {
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        email_verified: user.email_verified,
        last_login_at: user.last_login_at,
      },
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token 刷新成功',
  })
  async refresh(@CurrentUser() user: User) {
    const result = await this.authService.refreshToken(user.id);

    return {
      success: true,
      data: result,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登出' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '登出成功',
  })
  async logout() {
    // JWT 是 stateless 的，前端直接刪除 token 即可
    return {
      success: true,
      message: '登出成功',
    };
  }
}
