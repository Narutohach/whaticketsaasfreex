const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (process.env.NODE_ENV === "production" && (!jwtSecret || !jwtRefreshSecret)) {
  throw new Error(
    "FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be explicitly defined in environment variables for production!"
  );
}

export default {
  secret: jwtSecret || "dev_secret_insecure_only_for_local_testing",
  expiresIn: "15m",
  refreshSecret: jwtRefreshSecret || "dev_refresh_secret_insecure_only_for_local_testing",
  refreshExpiresIn: "7d"
};
