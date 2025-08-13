import { JwtPayload } from "../../core/interfaces/services/IJwtService"; 

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}
