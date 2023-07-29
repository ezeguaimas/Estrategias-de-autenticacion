import { Router } from "express";
import usersModel from "../dao/models/usersModel.js";
import { ADMIN_USER, ADMIN_PASS } from "../utils/adminConfig.js";
import { createHash, isValidPassword } from "../utils/utils.js";
import passport from "passport";

const router = Router();

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/sessions/failregister",
    failureFlash: true,
  }),
  async (req, res) => {
    req.session.user = {
      name: `${req.body.firstName} ${req.body.lastName}`,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      userRole: "user",
    };
    res.send({ status: 1, msg: "Usuario registrado con éxito" });
  }
);

router.post("/failregister", async (req, res) => {
  res.send({ status: 0, msg: "Error al registrar" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .send({ status: "error", error: "Complete todos los campos " });
    let user;
    if (email.toLowerCase() === ADMIN_USER.toLowerCase()) {
      if (password !== ADMIN_PASS) {
        return res
          .status(400)
          .send({ status: 0, msg: "La contraseña es incorrecta" });
      }

      user = {
        firstName: "Admin",
        lastName: "Coder",
        email: ADMIN_USER,
        dateOfBirth: "",
        userRole: "admin",
      };
    } else {
      user = await usersModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });
      if (!user) {
        return res
          .status(400)
          .send({ status: 0, msg: "El nombre de usuario es incorrecto" });
      }
      if (!isValidPassword(user, password))
        return res
          .status(403)
          .send({ status: "error", error: "La contraseña es incorrecta" });
      delete user.password;
      user = { ...user.toObject(), userRole: "user" };
    }
    req.session.user = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      userRole: user.userRole,
    };
    res.send({
      status: 1,
      msg: "Usuario logueado correctamente",
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).send({ status: 0, msg: "Error al loguear" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.send({ status: 1, msg: "Usuario deslogueado correctamente" });
});

router.put(
  "/resetpassword",
  passport.authenticate("resetPassword", {
    failureRedirect: "/api/sessions/failresetpassword",
    failureFlash: true,
  }),
  async (req, res) => {
    res.send({
      status: 1,
      msg: "Contraseña restaurada correctamente",
    });
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", {
    failureRedirect: "/api/sessions/login",
  }),
  async (req, res) => {
    req.session.user = {
      name: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      userRole: req.user.userRole,
    };
    res.redirect("/products");
  }
);
export default router;
