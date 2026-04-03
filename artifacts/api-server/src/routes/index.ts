import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import attendanceRouter from "./attendance";
import messagesRouter from "./messages";
import musicRouter from "./music";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(attendanceRouter);
router.use(messagesRouter);
router.use(musicRouter);
router.use(chatRouter);

export default router;
