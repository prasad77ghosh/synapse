export interface UserRegisteredEvent {
    id: string;
    name: string;
    email: string;
    token: string;
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
