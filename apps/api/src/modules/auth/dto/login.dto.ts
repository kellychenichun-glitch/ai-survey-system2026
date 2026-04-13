import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email 地址',
    example: 'admin@example.com',
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

  @ApiPropertyOptional({
    description: '記住我',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  remember_me?: boolean;
}
