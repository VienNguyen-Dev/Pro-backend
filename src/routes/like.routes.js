import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware";
import { getLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller";

const router = Router();

router.use(verifyJWT);

router.route("/v/:videoId").post(toggleVideoLike);
router.route("/c/:commentId").post(toggleCommentLike);
router.route("/t/:tweetId").post(toggleTweetLike);
router.route("/like-videos").get(getLikedVideo);