import { Router } from "express";
import { login, register } from "../controllers/user.controller";

const router = Router();

router.post("/signin", login);
router.post("/signup", register);

export default router;