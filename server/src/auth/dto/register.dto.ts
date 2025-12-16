import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: '사용자명은 최소 3자 이상이어야 합니다' })
    @MaxLength(20, { message: '사용자명은 최대 20자까지 가능합니다' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: '사용자명은 영문, 숫자, _만 사용 가능합니다'
    })
    username: string;

    @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
    @MaxLength(100, { message: '이메일은 최대 100자까지 가능합니다' })
    email: string;

    @IsString()
    @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
    @MaxLength(50, { message: '비밀번호는 최대 50자까지 가능합니다' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message: '비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다'
    })
    password: string;
}
