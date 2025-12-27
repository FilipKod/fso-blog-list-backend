const jwt = require("jsonwebtoken");
const logger = require("./logger");
const User = require("../models/user");

const errorHandler = (error, request, response, next) => {
  logger.error(error);

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error collection")
  ) {
    return response.status(409).json({ error: "username must be unique" });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({ error: "token expired" });
  } else if (
    error.name === "JsonWebTokenError" &&
    error.message.includes("jwt malformed")
  ) {
    return response.status(401).json({ error: "token malformatted" });
  } else if (
    error.name === "JsonWebTokenError" &&
    error.message.includes("invalid token")
  ) {
    return response.status(401).json({ error: "token invalid" });
  } else if (
    error.name === "JsonWebTokenError" &&
    error.message.includes("jwt must be provided")
  ) {
    return response.status(401).json({ error: "token missing" });
  }

  next();
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  } else {
    request.token = null;
  }

  next();
};

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: "invalid token" });
  }

  const user = await User.findById(decodedToken.id).select("-passwordHash");

  if (!user) {
    return response.status(401).json({ error: "UserId missing or not valid" });
  }

  request.user = user;

  next();
};

const requestAuth = [tokenExtractor, userExtractor];

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor,
  requestAuth,
};
