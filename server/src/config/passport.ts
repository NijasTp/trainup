import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import dotenv from "dotenv";
import { logger } from "../utils/logger.util";
dotenv.config();

@injectable()
export class PassportConfig {
  constructor(@inject(TYPES.IUserRepository) private userRepo: IUserRepository) {
    logger.info("Initializing PassportConfig");
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_REDIRECT_URI!,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            logger.info(`Google Strategy: Processing profile ${profile.id}`); // Debug log
            let user = await this.userRepo.findByGoogleId(profile.id);
            if (!user) {
              user = await this.userRepo.createUser({
                googleId: profile.id,
                email: profile.emails![0].value,
                name: profile.displayName,
                role: "user",
              });
            }
            return done(null, user);
          } catch (err: unknown) {
            logger.error("Google Strategy Error:", err);
            return done(err as Error);
          }
        }
      )
    );

    passport.serializeUser((user: unknown, done) => {
      done(null, (user as { id: string }).id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await this.userRepo.findById(id);
        done(null, user);
      } catch (err: unknown) {
        done(err as Error);
      }
    });
  }
}