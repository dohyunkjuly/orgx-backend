export function verificationEmail(params: { fullName: string; verifyUrl: string; ttlHours: number }): {
  subject: string
  html: string
} {
  return {
    subject: 'Verify your email',
    html: `
      <p>Hi ${params.fullName},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${params.verifyUrl}">Verify email</a></p>
      <p>This link expires in ${params.ttlHours} hours.</p>
    `,
  }
}

export function passwordResetEmail(params: { fullName: string; resetUrl: string; ttlMinutes: number }): {
  subject: string
  html: string
} {
  return {
    subject: 'Reset your password',
    html: `
      <p>Hi ${params.fullName},</p>
      <p>Reset your password by clicking the link below:</p>
      <p><a href="${params.resetUrl}">Reset password</a></p>
      <p>This link expires in ${params.ttlMinutes} minutes. If you didn't request this, ignore this email.</p>
    `,
  }
}
