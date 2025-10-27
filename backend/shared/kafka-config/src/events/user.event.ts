export interface UserRegisteredEvent {
  userId: string;
  email: string;
  phone?: string;
  username: string;
  fullName: string;
  registeredAt: string;

  emailVerificationToken: string;
  phoneVerificationToken?: string;

  registrationSource: "web" | "mobile" | "api";
  ipAddress?: string;
  deviceInfo?: string;
}

export interface UserEmailVerifiedEvent {
  userId: string;
  email: string;
  verifiedAt: string;
}

export interface UserPhoneVerifiedEvent {
  userId: string;
  phone: string;
  verifiedAt: string;
}
