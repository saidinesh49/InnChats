import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRoute from "./routes/auth.routes.js";
import friendsListRouter from "./routes/friendsList.routes.js";

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// CORS setup
const corsOptions = {
  origin: ["http://localhost:4200", process.env.FRONTEND_URL],
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

// Body parser setup
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.get("/", (req, res) => {
  return res.json({ message: "Server is running" });
});

app.use("/auth", authRoute);
app.use("/friendsList", friendsListRouter);

export { app };
