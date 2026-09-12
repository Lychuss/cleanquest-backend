import { Ollama } from "ollama";
import dotenv from "dotenv";
dotenv.config();

export const ollama = new Ollama({
    host: process.env.OLLAMA_HOST!
});
