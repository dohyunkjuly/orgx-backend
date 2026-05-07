import { PrismaClient, Gender, MemberStatus, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const PASSWORD = 'Password123!'

type SeedUser = {
  email: string
  fullName: string
  role: Role
  status: MemberStatus
  isEmailVerified: boolean
  gender: Gender
  phone?: string
  qualification: string
  university: string
  department: string
  designation: string
  degreeDate?: Date
}

const users: SeedUser[] = [
  {
    email: 'admin@orgx.test',
    fullName: 'Alice Admin',
    role: Role.ADMIN,
    status: MemberStatus.ACTIVE,
    isEmailVerified: true,
    gender: Gender.FEMALE,
    phone: '+10000000001',
    qualification: 'PhD',
    university: 'Org X University',
    department: 'Administration',
    designation: 'Director',
    degreeDate: new Date('2010-06-01'),
  },
  {
    email: 'member1@orgx.test',
    fullName: 'Bob Member',
    role: Role.MEMBER,
    status: MemberStatus.ACTIVE,
    isEmailVerified: true,
    gender: Gender.MALE,
    qualification: 'PhD in Computer Science',
    university: 'Org X University',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    degreeDate: new Date('2018-12-15'),
  },
  {
    email: 'member2@orgx.test',
    fullName: 'Carol Member',
    role: Role.MEMBER,
    status: MemberStatus.ACTIVE,
    isEmailVerified: true,
    gender: Gender.FEMALE,
    qualification: 'MSc in Data Science',
    university: 'Org X University',
    department: 'Data Science',
    designation: 'Lecturer',
    degreeDate: new Date('2020-08-20'),
  },
  {
    email: 'pending@orgx.test',
    fullName: 'Dan Pending',
    role: Role.MEMBER,
    status: MemberStatus.PENDING,
    isEmailVerified: false,
    gender: Gender.MALE,
    qualification: 'MSc',
    university: 'Org X University',
    department: 'Mathematics',
    designation: 'Visiting Scholar',
  },
  {
    email: 'suspended@orgx.test',
    fullName: 'Eve Suspended',
    role: Role.MEMBER,
    status: MemberStatus.SUSPENDED,
    isEmailVerified: true,
    gender: Gender.FEMALE,
    qualification: 'PhD',
    university: 'Org X University',
    department: 'Physics',
    designation: 'Researcher',
    degreeDate: new Date('2015-05-10'),
  },
  {
    email: 'rejected@orgx.test',
    fullName: 'Frank Rejected',
    role: Role.MEMBER,
    status: MemberStatus.REJECTED,
    isEmailVerified: true,
    gender: Gender.OTHER,
    qualification: 'BSc',
    university: 'Org X University',
    department: 'Biology',
    designation: 'Applicant',
  },
]

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        isEmailVerified: u.isEmailVerified,
        gender: u.gender,
        phone: u.phone ?? null,
        qualification: u.qualification,
        degreeDate: u.degreeDate ?? null,
        university: u.university,
        department: u.department,
        designation: u.designation,
      },
      create: {
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        isEmailVerified: u.isEmailVerified,
        gender: u.gender,
        phone: u.phone ?? null,
        qualification: u.qualification,
        degreeDate: u.degreeDate ?? null,
        university: u.university,
        department: u.department,
        designation: u.designation,
      },
    })
    console.log(`✓ ${u.email}  [${u.role}/${u.status}${u.isEmailVerified ? '' : '/unverified'}]`)
  }

  console.log(`\nSeeded ${users.length} user(s). Password for all: ${PASSWORD}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
