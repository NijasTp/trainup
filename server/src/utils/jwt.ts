import jwt from "jsonwebtoken";
import { Response } from "express";
import { injectable } from "inversify";
import dotenv from 'dotenv'
import { IJwtService } from "../core/interfaces/services/IJwtService";
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

@injectable()
export class JwtService implements IJwtService {
  generateAccessToken(id: string, role: string, tokenVersion: number): string {
    if (!JWT_SECRET) {
      throw new Error('JWT SECRET is not defined in environment variables.');
    }
    return jwt.sign({ id, role, tokenVersion }, JWT_SECRET, { expiresIn: "15m" });
  }

  generateRefreshToken(id: string, role: string, tokenVersion: number): string {
    if (!JWT_REFRESH_SECRET) {
      throw new Error('JWT REFRESH SECRET is not defined in environment variables.');
    }
    return jwt.sign({ id, role, tokenVersion }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  }

  static verifyToken(token: string): any {
    if (!JWT_SECRET) {
      throw new Error('JWT SECRET is not defined in environment variables.');
    }
    return jwt.verify(token, JWT_SECRET);
  }
  
  verifyRefreshToken(token: string): any {
    if (!JWT_REFRESH_SECRET) {
      throw new Error('JWT REFRESH SECRET is not defined in environment variables.');
    }
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }

  setTokens(res: Response, accessToken: string, refreshToken: string): void {
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })

      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  }
  setAccessToken(res: Response, accessToken: string): void {
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
  }
  clearTokens(res: Response): void {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

}
