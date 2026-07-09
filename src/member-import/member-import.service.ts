import { Injectable, Logger } from '@nestjs/common'
import { parse } from 'csv-parse/sync'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { ApiHttpError, MEMBER_IMPORT_EMPTY_FILE, MEMBER_IMPORT_INVALID_FILE } from '@lib/core'
import { Gender } from '@prisma/client'
import { UsersRepository } from '../common/repositories/users.repository'
import { AuditLogRepository } from '../common/repositories/audit-log.repository'
import { MemberCsvCleaner, type RawMemberRow } from './member-csv-cleaner'
import type { MemberImportResultDto } from './dto/import-response.dto'

const BCRYPT_ROUNDS = 12

@Injectable()
export class MemberImportService {
  private readonly logger = new Logger(MemberImportService.name)
  private readonly cleaner = new MemberCsvCleaner()

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async run(file: Express.Multer.File, commit: boolean, actorId: string): Promise<MemberImportResultDto> {
    const { rows, headers } = this.parseCsv(file)
    if (rows.length === 0) throw new ApiHttpError(MEMBER_IMPORT_EMPTY_FILE)

    const cleaned = this.cleaner.clean(rows, headers)

    if (!commit) {
      return {
        committed: false,
        totalRows: cleaned.totalRows,
        validRows: cleaned.valid.length,
        duplicatesRemoved: cleaned.duplicatesRemoved,
        rejectedCount: cleaned.rejected.length,
        rejected: cleaned.rejected,
        imported: [],
        skippedExisting: 0,
      }
    }

    const imported: { id: string; email: string; fullName: string }[] = []
    let skippedExisting = 0

    for (const member of cleaned.valid) {
      const existing = await this.usersRepo.findByEmail(member.email)
      if (existing) {
        skippedExisting += 1
        continue
      }

      const tempPassword = this.generateTempPassword()
      const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS)

      const created = await this.usersRepo.create({
        email: member.email,
        passwordHash,
        fullName: member.fullName,
        gender: member.gender as Gender,
        phone: member.phone,
        qualification: member.qualification,
        university: member.university,
        department: member.department,
        designation: member.designation,
        role: 'MEMBER',
        status: 'ACTIVE',
        isEmailVerified: true,
      })

      imported.push({ id: created.id, email: created.email, fullName: created.fullName })
    }

    await this.audit.create({
      actorId,
      action: 'MEMBERS_IMPORTED',
      targetType: 'User',
      targetId: 'bulk-import',
      targetLabel: file.originalname,
      metadata: {
        totalRows: cleaned.totalRows,
        imported: imported.length,
        skippedExisting,
        rejected: cleaned.rejected.length,
        duplicatesRemoved: cleaned.duplicatesRemoved,
      },
    })

    return {
      committed: true,
      totalRows: cleaned.totalRows,
      validRows: cleaned.valid.length,
      duplicatesRemoved: cleaned.duplicatesRemoved,
      rejectedCount: cleaned.rejected.length,
      rejected: cleaned.rejected,
      imported,
      skippedExisting,
    }
  }

  private parseCsv(file: Express.Multer.File): { rows: RawMemberRow[]; headers: string[] } {
    let records: Record<string, string>[]
    try {
      records = parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      })
    } catch (err) {
      this.logger.warn(`Failed to parse uploaded CSV ${file.originalname}: ${(err as Error).message}`)
      throw new ApiHttpError(MEMBER_IMPORT_INVALID_FILE)
    }

    const headers = records.length ? Object.keys(records[0]) : []
    return { rows: records, headers }
  }

  /** Generates a random temporary password meeting the same complexity rules as registration. */
  private generateTempPassword(): string {
    const raw = randomBytes(9).toString('base64url') // ~12 chars, url-safe
    return `${raw}Aa1!`
  }
}
