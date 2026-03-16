/**
 * Local dev server for the Cloudinary media API.
 * Run with: npm run dev:api (or use npm run dev to run site + API together).
 */
import "dotenv/config";
import app from "../netlify/functions/lib/cloudinary-app.mjs";

const PORT = Number(process.env.CLOUDINARY_API_PORT) || 3456;

app.listen(PORT, () => {
  console.log(`[cloudinary-api] http://localhost:${PORT}/api/cloudinary/media`);
});
