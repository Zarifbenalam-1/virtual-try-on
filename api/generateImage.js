// generateImage.js
// This is a production-ready serverless function for Vercel that handles virtual try-on image generation using Google Gemini API.
// It receives a POST request from the Framer frontend with the user's uploaded photo (as base64), the product image URL (from CMS),
// and a prompt. It securely calls the Gemini API (key stored in env vars), generates a try-on image, and returns a base64 URL for display.
// Security: API key is hidden in Vercel env vars—never exposed to client. Handles errors gracefully for robustness.
// Cost: Gemini is pay-per-use (~$0.0005/image); monitor in Google console.
// Scalability: Vercel auto-scales; add rate-limiting if traffic grows.
// Customization: Tweak prompt for better results; add image compression if base64 is too large.

const { GoogleGenerativeAI } = require("@google/generative-ai"); // Required dependency—install via package.json.

export default async function handler(req, res) {
  // Restrict to POST requests only (from Framer frontend).
  // This prevents unauthorized access (e.g., GET requests).
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse the request body safely.
  // Extract userPhoto (base64 string), productImage (URL string), and prompt (string).
  const { userPhoto, productImage, prompt } = req.body;

  // Validate required fields to avoid processing invalid requests.
  // This helps catch errors early and saves costs.
  if (!userPhoto || !productImage || !prompt) {
    return res.status(400).json({ error: "Missing required fields: userPhoto, productImage, or prompt" });
  }

  // Retrieve Google API key from environment variables (set in Vercel dashboard).
  // This keeps the key secure—never hardcode it.
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Google API key not configured" });
  }

  try {
    // Initialize the Gemini API client with the key.
    const genAI = new GoogleGenerativeAI(apiKey);

    // Select the model: Use "gemini-1.5-flash" for speed and cost-efficiency (good for image generation tasks).
    // Note: If you have access to "gemini-2.5-flash" (preview), switch here; 1.5 is stable and widely available.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the product image: Fetch from URL and convert to base64 (Gemini requires inline data).
    // This step ensures both images are in the same format for the API.
    const productResponse = await fetch(productImage);
    if (!productResponse.ok) {
      throw new Error(`Failed to fetch product image: ${productResponse.statusText}`);
    }
    const productBuffer = await productResponse.arrayBuffer();
    const productBase64 = Buffer.from(productBuffer).toString("base64");
    const productMimeType = productResponse.headers.get("content-type") || "image/png"; // Detect MIME or default.

    // Extract user photo base64 (strip data URL prefix if present, e.g., "data:image/jpeg;base64,").
    // Assume JPEG for user uploads; adjust if needed.
    const userBase64 = userPhoto.split(",")[1] || userPhoto;

    // Build the multi-modal content array for Gemini:
    // - Text prompt first (instructions for try-on).
    // - User photo second.
    // - Product image third.
    const content = [
      { text: prompt }, // e.g., "Drape the clothing from the second image onto the person in the first image, preserving pose, face, and background. Make it realistic and high-quality."
      {
        inlineData: {
          mimeType: "image/jpeg", // User photo MIME.
          data: userBase64
        }
      },
      {
        inlineData: {
          mimeType: productMimeType, // Product MIME.
          data: productBase64
        }
      }
    ];

    // Call Gemini to generate the content.
    // This sends the request and waits for the response (async for non-blocking).
    const result = await model.generateContent(content);

    // Extract the generated image base64 from the response.
    // Gemini returns it in candidates[0].content.parts[0].inlineData.data (assume PNG output).
    // Handle errors if no content (e.g., safety blocks).
    const generatedBase64 = result.response.candidates[0].content.parts[0].inlineData.data;
    if (!generatedBase64) {
      throw new Error("No generated image in Gemini response");
    }

    // Format as base64 URL for easy <img src> use in Framer.
    const generatedImageUrl = `data:image/png;base64,${generatedBase64}`;

    // Return success response with the URL.
    return res.status(200).json({ generatedImageUrl });

  } catch (error) {
    // Comprehensive error handling: Log and return user-friendly message.
    // This prevents crashes and helps debugging (Vercel logs errors automatically).
    console.error("Error in image generation:", error.message || error);
    return res.status(500).json({ error: "Failed to generate try-on image. Please try again or check logs." });
  }
}
