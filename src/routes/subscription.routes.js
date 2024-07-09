import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { getSubscribedChanel, getUserChanelSubscriber, toggleSubscription } from "../controllers/subscription.controller";

const router = Router();
router.use(verifyJWT);

router.route('/c/:chanelId')
  .post(toggleSubscription)
  .get(getUserChanelSubscriber);

router.route("/u/:chanelId")
  .get(getSubscribedChanel);

export default router;