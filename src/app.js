import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js'

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

export { app }

