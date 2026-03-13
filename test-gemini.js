import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AIzaSyCvKKaf3NJwVWOCK1P9kF9zqNAPO6sHKr4";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
  try {
    const result = await model.generateContent("Hello!");
    const response = await result.response;
    console.log("SUCCESS:", response.text());
  } catch (error) {
    console.error("ERROR:", error.message, error);
  }
}

test();
