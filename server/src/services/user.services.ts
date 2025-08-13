import { injectable, inject } from "inversify";
import bcrypt from "bcrypt";
import { IUserService } from "../core/interfaces/services/IUserService";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import TYPES from "../core/types/types";
import { IJwtService } from "../core/interfaces/services/IJwtService";
import { IUser } from "../models/user.model";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID||"";
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

@injectable()
export class UserService implements IUserService {
  private googleClient: OAuth2Client;
  constructor(
    @inject(TYPES.IUserRepository) private userRepo: IUserRepository,
    @inject(TYPES.IJwtService) private jwtService: IJwtService
  ) {
    this.userRepo = userRepo;
    this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  public async registerUser(name: string, email: string, password: string) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) throw new Error("User already exists");

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepo.createUser({ name, email, password: hashed });

    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), user.role, user.tokenVersion ?? 0);
    const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), user.role, user.tokenVersion ?? 0);

    return { user, accessToken, refreshToken };
  }

  public async resetPassword(email: string, newPassword: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new Error("User not found")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword

    await this.userRepo.updateUser(user._id.toString(), { password: hashedPassword })
  }


  public async loginUser(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) throw new Error("User not found");
    if (!user.password) throw new Error("User has no password");
    if (user.isBanned) throw new Error("This user is banned")

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password");

    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), user.role, user.tokenVersion ?? 0);
    const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), user.role, user.tokenVersion ?? 0);

    return { user, accessToken, refreshToken };
  }

  async loginWithGoogle(idToken: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    const { sub: googleId, email, name } = payload;
    if (!googleId || !email) {
      throw new Error('Google token missing required fields');
    }
    let user = await this.userRepo.findByGoogleId(googleId);
    if (!user) {
      user = await this.userRepo.findByEmail(email);
    }

    if (!user) {
      user = await this.userRepo.createUser({
        googleId,
        email,
        name,
      });
    } else if (!user.googleId) {
      throw new Error('User is not linked to Google');
    }


    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), user.role, user.tokenVersion?? 0);
    const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), user.role, user.tokenVersion?? 0);
    return { user, accessToken, refreshToken };
  }


   async getAllUsers(
  page: number,
  limit: number,
  search: string,
  isBanned ?: string,
  isVerified ?: string,
  startDate ?: string,
  endDate ?: string
) {
  return await this.userRepo.findUsers(page, limit, search, isBanned, isVerified, startDate, endDate);
}
  async getUserById(id: string) {
  return await this.userRepo.findById(id);
}



  async updateUserStatus(id: string, updateData: Partial<IUser>) {
  if (updateData.isBanned !== undefined) {
    return await this.userRepo.updateStatusAndIncrementVersion(id, { isBanned: updateData.isBanned });
  }

  return await this.userRepo.updateStatus(id, updateData);
}
}
