import { Router } from "express";
import { login, register } from "../controllers/user.controller";
import { getMe } from "../service/user.service";
import { isAuthenticatedUser } from "../middleware/auth.middleware";

const router = Router();

router.post("/signin", login);
router.post("/signup", register);
router.get("/get-me", isAuthenticatedUser, getMe);

export default router;
