import { UserRole } from '../../common/enums/user-role.enum';

export interface UserPayload {
    sub: string;
    email?: string;
    role?: UserRole;
    iat?: number;
    exp?: number;
}
