import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, remember_me } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      throw new UnauthorizedException(
        `帳號已被鎖定，請於 ${user.locked_until.toLocaleString()} 後再試`,
      );
    }

    // Check if account is suspended
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('帳號已被停用，請聯繫管理員');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failed_login_attempts += 1;

      // Lock account after 5 failed attempts
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // Reset failed login attempts
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login_at = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const payload = { sub: user.id, email: user.email };
    const expiresIn = remember_me ? '30d' : '1h';

    const access_token = this.jwtService.sign(payload, { expiresIn });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: remember_me ? 30 * 24 * 60 * 60 : 3600,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('帳號已被停用');
    }

    return user;
  }

  async register(email: string, password: string, fullName: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('此 Email 已被註冊');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      hashed_password: hashedPassword,
      full_name: fullName,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.validateUser(payload.sub);

      const newPayload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(newPayload);

      return {
        access_token,
        token_type: 'Bearer',
        expires_in: 3600,
      };
    } catch (error) {
      throw new UnauthorizedException('無效的 Refresh Token');
    }
  }
}
