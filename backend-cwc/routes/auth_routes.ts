import express from "express";
import authControllers from "../controllers/auth_controller";
import { Router } from "express";

const router = express.Router();

router.post("/register", authControllers.register);

router.post("/login", authControllers.login);

router.post("/refresh", authControllers.refresh);

router.get("/me", authControllers.getUser);

router.post("/logout", authControllers.logout);

export default router;