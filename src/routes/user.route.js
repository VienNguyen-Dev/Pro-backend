import express from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';


const router = express.Router();

router.route("/register", upload.fields([
  {
    name: "avatar",
    maxCount: 1
  },
  { name: "corverImage", maxCount: 1 }
])).post(registerUser);
router.route("/login").post(loginUser);

export default router