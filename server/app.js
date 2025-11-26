import dotenv from "dotenv";
dotenv.config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const helpRoutes = require("./routes/helpRoutes");
const authRoutes = require("./routes/authRoutes");
const boardRoutes = require("./routes/boardRoutes");
const columnRoutes = require("./routes/columnRoutes");
const cardRoutes = require("./routes/cardRoutes");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const parseAllowedOrigins = () => {
  if (!process.env.CLIENT_URL) {
    return [];
  }

  return process.env.CLIENT_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const buildCorsConfig = () => {
  const allowedOrigins = parseAllowedOrigins();

  if (!allowedOrigins.length) {
    return {};
  }

  return {
    origin: allowedOrigins,
    credentials: true,
  };
};

app.use(cors(buildCorsConfig()));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/help", helpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes); // board + board-column
app.use("/api/columns", columnRoutes); // column update/delete
app.use("/api/cards", cardRoutes); // card CRUD + move

app.use((req, res, next) => {
  const error = new Error("Kaynak bulunamadı");
  error.statusCode = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    message: err.message || "Sunucuda beklenmeyen bir hata oluştu",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
