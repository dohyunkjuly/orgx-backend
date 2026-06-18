import { ApiProperty } from '@nestjs/swagger'

export class TwoFactorSetupDto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'Base32 TOTP secret (for manual entry)' })
  secret!: string

  @ApiProperty({
    example: 'otpauth://totp/OrgX:user@example.com?secret=...',
    description: 'otpauth:// URI encoded in the QR code',
  })
  otpauthUrl!: string

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgo...',
    description: 'QR code as a data URL — render directly in an <img> for the user to scan',
  })
  qrCode!: string
}
