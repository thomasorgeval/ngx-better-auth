export interface RegisterPasskey {
  attestation: string
  challenge: string
  extension: object
  timeout: number
  authenticatorSelection: {
    authenticatorAttachment?: AuthenticatorAttachment
    requireResidentKey: boolean
    userVerification: UserVerificationRequirement
  }
  excludeCredentials: {
    id: string
    type: string
    transports: AuthenticatorTransport[]
  }[]
  rp: {
    name: string
    id?: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
}

export interface Passkey {
  backedUp: boolean
  counter: number
  credentialID: string
  deviceType: string
  publicKey: string
  userId: string
  aaguid?: string
  createdAt?: string
  id?: string
  name?: string
  transports?: string
}
