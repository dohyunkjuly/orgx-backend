export function accountApprovedEmail(params: { fullName: string; loginUrl: string }): {
  subject: string
  html: string
} {
  return {
    subject: 'Your account has been approved',
    html: `
      <p>Hi ${params.fullName},</p>
      <p>Good news — your account has been approved and is now active.</p>
      <p>You can sign in here: <a href="${params.loginUrl}">${params.loginUrl}</a></p>
    `,
  }
}

export function accountRejectedEmail(params: { fullName: string }): {
  subject: string
  html: string
} {
  return {
    subject: 'Your account application was rejected',
    html: `
      <p>Hi ${params.fullName},</p>
      <p>We're sorry to inform you that your account application has been rejected.</p>
      <p>If you believe this is a mistake, please contact the organization administrators.</p>
    `,
  }
}
