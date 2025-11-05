export interface JwtPayload {
  iss: string;
  sub: string;
  email: string;
  userId: string;
  deviceId: string;
}
