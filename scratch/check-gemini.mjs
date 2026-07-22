import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
let apiKey = process.env.GEMINI_API_KEY || "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2 && parts[0].trim() === "GEMINI_API_KEY") {
      apiKey = parts.slice(1).join("=").trim();
    }
  });
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  const modelsToTest = ["gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-2.5-flash"];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent("Respond with working");
      console.log(`✅ SUCCESS with model ${modelName}! Output:`, res.response.text());
      return modelName;
    } catch (err) {
      console.log(`❌ Failed with ${modelName}:`, err.message);
    }
  }
}

testModels();
