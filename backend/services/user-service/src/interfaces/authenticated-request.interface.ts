import { JwtPayload } from './auth-payload.interface';

export interface JwtRequest extends Request {
  user: JwtPayload;
}
