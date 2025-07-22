export interface UserPayload {
    sub: number
    email?: string
    role?: 'user' | 'admin'
    iat?: number
    exp?: number
}