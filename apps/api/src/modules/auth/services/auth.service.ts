import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 查找使用者
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email 或密碼錯誤');
    }

    // 檢查帳號是否被鎖定
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedException(
        `帳號已被鎖定，請於 ${user.locked_until} 後再試`,
      );
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    if (!isPasswordValid) {
      // 增加失敗次數
      user.failed_login_attempts += 1;

      // 如果失敗次數達到 5 次，鎖定帳號 30 分鐘
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 30 * 60 * 1000);
      }

      await this.userRepository.save(user);

      throw new UnauthorizedException('Email 或密碼錯誤');
    }

    // 重置失敗次數
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login_at = new Date();

    await this.userRepository.save(user);

    // 生成 JWT Token
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, full_name } = registerDto;

    // 檢查 Email 是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('此 Email 已被註冊');
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 建立使用者
    const user = this.userRepository.create({
      email,
      hashed_password: hashedPassword,
      full_name,
      status: 'active',
      email_verified: false,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      status: user.status,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    return user;
  }

  async refreshToken(userId: string) {
    const user = await this.validateUser(userId);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }
}
