import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRoute from "./routes/auth.routes.js";
import friendsListRouter from "./routes/friendsList.routes.js";
import messageRouter from "./routes/message.routes.js";
import awsRouter from "./routes/aws.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const corsOptions = {
  origin: [
    "http://localhost:4200",
    process.env.FRONTEND_URL,
    "https://innchats.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [
    "Origin",
    "Accept",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  return res.json({ message: "Server is running" });
});

app.use("/auth", authRoute);
app.use("/friendsList", friendsListRouter);
app.use("/message", messageRouter);
app.use("/aws", awsRouter);

export { app };
