import { Router } from "express";
import { login, register, userAuthCheck } from "../controllers/user.controller";
import { isAuthenticatedUser } from "../middleware/auth.middleware";

const router = Router();

router.post("/signin", login);
router.post("/signup", register);
router.get("/get-me", isAuthenticatedUser, userAuthCheck);

export default router;
