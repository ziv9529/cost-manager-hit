const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectDB } = require("../database/mongoose");
const { saveLogToMongoDB } = require("../database/logger");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const apiRouter = require("./routes/api");

const app = express();

const connectDatabase = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (err) {
    console.error(
      "\x1b[34m[USERS-SERVICE]\x1b[0m MongoDB connection error:",
      err.message
    );
    process.exit(1);
  }
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Pino logging middleware - save to MongoDB
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    saveLogToMongoDB({
      userid: req.body?.userid || req.params?.id || 0,
      action: `${req.method} ${req.originalUrl}`,
      details: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
      },
    });
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app, connectDB: connectDatabase };
