import serverlessHttp from "serverless-http";
import app from "./lib/cloudinary-app.mjs";

export const handler = serverlessHttp(app);
