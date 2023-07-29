import passport from "passport";
import local from "passport-local";
import userService from "../dao/models/usersModel.js";
import { createHash, isValidPassword } from "../utils/utils.js";
import GitHubStrategy from "passport-github2";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "../utils/githubConfig.js";

const LocalStrategy = local.Strategy;
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { firstName, lastName, email, dateOfBirth } = req.body;
        try {
          const user = await userService.findOne({ email: username });
          if (user) {
            return done(null, false, { message: "El usuario ya existe" });
          }
          const newUser = {
            firstName,
            lastName,
            email,
            dateOfBirth,
            password: createHash(password),
          };
          const createdUser = await userService.create(newUser);
          return done(null, createdUser);
        } catch (error) {
          return done({ error: "Error al crear el usuario" });
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          let user;
          if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
            if (password !== ADMIN_PASSWORD) {
              return done(null, false, { msg: "La contraseña es incorrecta" });
            }
            user = {
              firstName: "Admin",
              lastName: "Coder",
              email: ADMIN_USER,
              dateOfBirth: "",
              userRole: "admin",
            };
          } else {
            user = await userService.findOne({
              email: { $regex: new RegExp(`^${username}$`, "i") },
            });
            if (!user) {
              return done(null, false, { msg: "Usuario no encontrado" });
            }
            if (!isValidPassword(user, password)) {
              return done(null, false, { msg: "La contraseña es incorrecta" });
            }
            user = { ...user.toObject(), userRole: "user" };
            return done(null, user);
          }
        } catch (error) {
          return done({ msg: "Error iniciando sesión" });
        }
      }
    )
  );

  passport.use(
    "resetPassword",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "newPassword",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const user = await usersModel.findOne({
            email: { $regex: new RegExp(`^${username}$`, "i") },
          });
          if (!user) {
            return done(null, false, { msg: "Usuario no encontrado" });
          }
          const newPassword = createHash(password);
          await usersModel.updateOne(
            { _id: user._id },
            { $set: { password: newPassword } }
          );
          return done(null, user);
        } catch (error) {
          return done({ msg: "Error reseteando contraseña" });
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log({ profile });
          let user = await userService.findOne({ email: profile._json.email });
          if (!user) {
            user = {
              firstName: profile._json.name,
              lastName: "",
              email: profile._json.email,
              password: "",
            };
            user = await userService.create(user);
          }
          user = { ...user.toObject(), userRole: "user" };
          return done(null, user);
        } catch (error) {
          return done({ message: "Error en el login con Github" });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await userService.findOne({ _id });
      return done(null, user);
    } catch {
      return done({ message: "Error deserializando usuario" });
    }
  });
};

export default initializePassport;
