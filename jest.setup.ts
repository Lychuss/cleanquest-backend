import dotenv from "dotenv";

dotenv.config({ path: ".env.test", override: true });   

if (!process.env.DATABASE_URL?.includes("_test")) {
  throw new Error("Refusing to run tests: DATABASE_URL is not a test database");
}