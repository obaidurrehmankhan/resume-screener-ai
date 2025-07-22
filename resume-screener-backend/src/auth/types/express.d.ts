import { UserPayload } from '@/auth/types/user-payload'

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload
        }
    }
}
