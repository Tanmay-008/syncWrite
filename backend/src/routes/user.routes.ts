import { Router } from "express";
import { login, logoutUser, refreshAccessToken, register, userAuthCheck } from "../controllers/user.controller";
import { isAuthenticatedUser } from "../middleware/auth.middleware";

const router = Router();

router.post("/signin", login);
router.post("/signup", register);
router.get("/get-me", isAuthenticatedUser, userAuthCheck);
router.post("/logout", isAuthenticatedUser, logoutUser);
router.post("/refresh-access-token", refreshAccessToken);

export default router;
