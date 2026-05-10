import type { Role, MemberStatus } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  role: Role
  status: MemberStatus
  isEmailVerified: boolean
}
