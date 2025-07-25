import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import userAgent from "express-useragent";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { IS_TEST, IS_DEVELOPMENT } from "@config/secrets";
import { AppError } from "@src/utils/app_error";
import { verifyToken } from "@src/utils/jwt";
import { get } from "lodash";
import { AnyZodObject } from "zod";
import { createRequestStore, setRequestProperty } from "@src/utils/store";
import { LOCALE_HEADER_KEY, TIMEZONE_HEADER_KEY } from "@src/constants";
import { formatDate } from "@src/utils/date";
import { add, endOfDay, startOfDay, sub } from "date-fns";
import { logger } from "@src/utils/logger";
import { Services } from "@src/services";
import qs from "qs";

const limiter = rateLimit({
  windowMs: 1000 * 60,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const loadMiddlewares = (app: Application) => {
  app.set("query parser", (str: string) => qs.parse(str));
  app.use((req, res, next) => {
    createRequestStore();
    const timezoneOffset = req.headers[TIMEZONE_HEADER_KEY];
    const locale = req.headers[LOCALE_HEADER_KEY];

    if (locale) {
      setRequestProperty("locale", locale as string);
    }
    if (timezoneOffset) {
      const timezoneOffsetInMinutes = parseInt(timezoneOffset as string);
      setRequestProperty("timezoneOffsetInMinutes", timezoneOffsetInMinutes);

      const currentFormattedDate = formatDate(sub(new Date(), { minutes: timezoneOffsetInMinutes }));
      const userEndOfDayInUTC = add(endOfDay(new Date(currentFormattedDate)), { minutes: timezoneOffsetInMinutes });
      const userStartOfDayInUTC = add(startOfDay(new Date(currentFormattedDate)), { minutes: timezoneOffsetInMinutes });

      setRequestProperty("currentFormattedUserDate", currentFormattedDate);
      setRequestProperty("userEndOfDayUTC", userEndOfDayInUTC);
      setRequestProperty("userStartOfDayUTC", userStartOfDayInUTC);
    }
    next();
  });
  app.use(cors());

  // Configure CSP based on environment
  const cspDirectives = {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "https://*.cloudflarestorage.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Added back for inline scripts
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Added back for inline styles
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https://cdn.coumo.com",
      "https://*.coumo.com",
      "https://*.r2.cloudflarestorage.com",
      "https://*.cloudflarestorage.com",
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  };

  // Add Docker-specific endpoints to connectSrc
  // These endpoints support the Docker setup where:
  // - API runs on port 8000 (api.localhost:8000 from host, tribenest-app:8000 from containers)
  // - Client runs on port 3000 (localhost:3000 or client.localhost:3000)
  // - Admin runs on port 3001 (localhost:3001 or admin.localhost:3001)
  const dockerEndpoints = [
    // API endpoints (from container perspective)
    "http://api.localhost:*",
    "http://admin.localhost:*",
    "http://localhost:*",
    // WebSocket support
    "ws://localhost:*",
    "ws://api.localhost:*",
  ];

  // Add Docker endpoints to connectSrc
  cspDirectives.connectSrc.push(...dockerEndpoints);

  // Add environment-specific endpoints if provided
  if (process.env.API_URL) {
    cspDirectives.connectSrc.push(process.env.API_URL);
  }
  if (process.env.CLIENT_URL) {
    cspDirectives.connectSrc.push(process.env.CLIENT_URL);
  }
  if (process.env.ADMIN_URL) {
    cspDirectives.connectSrc.push(process.env.ADMIN_URL);
  }

  // Configure Helmet based on environment
  const helmetConfig = {
    contentSecurityPolicy: false,
    trustProxy: true,
  };

  app.use(helmet(helmetConfig));
  app.use(compression());
  if (!IS_TEST) app.use(morgan("common"));
  app.use(userAgent.express());
  app.set("trust proxy", 1);
  app.use(limiter);
  logger.info("loaded middlewares");
};

export const notFound = (app: Application) => {
  app.use(/(.*)/, (req, res) => {
    res.status(404).json({
      status: 404,
      message: `Cannot find ${req.originalUrl} on this server`,
    });
  });
};

export const requireAuthentication = async (req: Request, next: NextFunction, services: Services) => {
  const authorizationHeader = req.headers["authorization"] as string;
  const accessToken = authorizationHeader?.split(" ")[1];

  if (!accessToken) return next(new AppError(401, "You are not logged in"));

  const decoded = verifyToken(accessToken);
  if (!decoded) return next(new AppError(401, "You are not logged in"));

  const session = await services.session.findById(get(decoded, "sessionId") as unknown as string);

  if (!session || !session.isValid) return next(new AppError(401, "You are not logged in"));

  const account = await services.account.findById(get(decoded, "accountId") as unknown as string);

  if (!account) {
    await services.session.deleteSession(session.id);
    return next(new AppError(401, "User no longer exists"));
  }

  req.account = account;
  req.session = session;
  setRequestProperty("currentAccountId", account.id);

  next();
};

export const publicAuthentication = async (
  req: Request,
  next: NextFunction,
  services: Services,
  throwOnUnauthenticated = false,
) => {
  const authorizationHeader = req.headers["authorization"] as string;
  const accessToken = authorizationHeader?.split(" ")[1];

  if (!accessToken) return throwOnUnauthenticated ? next(new AppError(401, "You are not logged in")) : next();

  const decoded = verifyToken(accessToken);
  if (!decoded) return throwOnUnauthenticated ? next(new AppError(401, "You are not logged in")) : next();

  const session = await services.session.findById(get(decoded, "sessionId") as unknown as string);

  if (!session || !session.isValid)
    return throwOnUnauthenticated ? next(new AppError(401, "You are not logged in")) : next();

  const account = await services.account.findById(get(decoded, "accountId") as unknown as string);

  if (!account) {
    await services.session.deleteSession(session.id);
    return throwOnUnauthenticated ? next(new AppError(401, "User no longer exists")) : next();
  }

  req.account = account;
  req.session = session;
  const membership = await services.membership.getAccountMembership(account.id, req.query.profileId as string);

  if (membership) {
    req.membership = membership;
  }
  // TODO: get the current profile id from the request query and get the user's membership details
  setRequestProperty("currentAccountId", account.id);

  next();
};

const formatZodError = (errors: any[]) => {
  return errors.map((err) => err.message);
};

export const validateResourceSchema =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (result.success) next();
    else
      res.status(400).json({
        message: formatZodError(result.error.errors),
      });
  };

export default loadMiddlewares;
