import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { Strategy as localStrategy } from "passport-local";
import bcryptjs from "bcryptjs";
import { User } from "../modules/users/user.model";
import { Role } from "../modules/users/user.interface";

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });

        if (!isUserExist) {
          return done("user does not exist");
        }

        const isGoogleAuthenticate = isUserExist.auths.some((providerObjects) => providerObjects.provider == "google");
        if (isGoogleAuthenticate && !isUserExist.password) {
          return done(null, false, {
            message:
              "You had authenticated through google.So, if you want to login with credentials, then at first login with the google and set a password for your gmail and then you can login with gmail and password",
          });
        }
        const isPasswordMatch = await bcryptjs.compare(password as string, isUserExist.password as string);

        if (!isPasswordMatch) {
          return done(null, false, { message: "Password does not match" });
        }
        return done(null);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (accessToken: string, refressToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "No Email Found" });
        }

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.RECEIVER || Role.SENDER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }
        return done(null);
      } catch (error) {
        console.log("Google Call-Back Error", error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
