import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import commentRouter from './routes/comment.routes.js'

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))//thiết lập middleware để phân tích dữ liệu được gửi lên từ các form (được gửi qua phương thức POST) trong các yêu cầu HTTP.
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use('/api/v1/videos', videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use('/api/v1/tweets', tweetRouter);
app.use("/api/v1/comments", commentRouter);

export { app }

