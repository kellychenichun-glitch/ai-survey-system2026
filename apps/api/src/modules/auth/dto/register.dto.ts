import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email 地址',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '請輸入有效的 Email 地址' })
  email: string;

  @ApiProperty({
    description: '密碼',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(6, { message: '密碼至少需要 6 個字元' })
  password: string;

  @ApiProperty({
    description: '全名',
    example: '張小明',
  })
  @IsString()
  @MaxLength(255)
  full_name: string;
}
