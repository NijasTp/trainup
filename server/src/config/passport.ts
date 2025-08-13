import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import dotenv from "dotenv";
dotenv.config();

@injectable()
export class PassportConfig {
  constructor(@inject(TYPES.IUserRepository) private userRepo: IUserRepository) {
    console.log("Initializing PassportConfig"); 
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_REDIRECT_URI!,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log("Google Strategy: Processing profile", profile.id); // Debug log
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
          } catch (err) {
            console.error("Google Strategy Error:", err);
            return done(err);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await this.userRepo.findById(id);
        done(null, user);
      } catch (err) {
        done(err);
      }
    });
  }
}