# Virtual Try-On Backend - GitHub Copilot Instructions

**ALWAYS follow these instructions first and fallback to search or additional context gathering only when you encounter unexpected information that does not match the information provided here.**

## Project Overview
This is a Vercel serverless backend for a virtual try-on application. It consists of a single Node.js API endpoint that uses Google's Generative AI (Gemini) to generate virtual try-on images by combining user photos with product images.

## Working Effectively

### Initial Setup and Dependencies
- **Install dependencies**: `npm install` -- takes under 1 second. NEVER CANCEL.
- **Node.js requirement**: Requires Node.js >= 18 (configured in package.json engines field)
- **Dependencies**: Single dependency `@google/generative-ai` for AI image generation

### Environment Configuration
- **Required environment variable**: `GOOGLE_API_KEY` must be set in Vercel dashboard or local .env file
- **Deployment**: Project is configured for Vercel serverless deployment (see vercel.json)
- **Local development**: Requires Vercel CLI and authentication for full local testing

### Project Structure
```
/
├── api/
│   └── generateImage.js     # Main serverless function
├── package.json             # Dependencies and Node.js config
├── vercel.json             # Vercel deployment configuration
└── .gitignore              # Excludes node_modules and env files
```

### Code Validation
- **Syntax check**: `node -c api/generateImage.js` -- validates JavaScript syntax, takes < 1 second
- **Structure validation**: The function exports a default async handler that:
  - Accepts POST requests only
  - Validates required fields (userPhoto, productImage, prompt)
  - Securely uses environment variables for API key
  - Handles base64 image processing
  - Includes comprehensive error handling

## Build and Test Process

### No Build Step Required
- **This project has no build step** - it's a single serverless function that runs directly on Vercel
- The Node.js function is deployed as-is with dependencies

### No Automated Tests
- **This project has no test suite** - validation must be done manually
- **No linting configuration** - syntax validation only available through `node -c`

### Manual Validation Requirements
After making changes to the API function, ALWAYS validate:

1. **Syntax validation**: `node -c api/generateImage.js`
2. **Function structure validation**: Ensure these components exist:
   - `export default async function handler` - ES module export
   - `req.method !== "POST"` - HTTP method validation  
   - Required fields validation for `userPhoto`, `productImage`, `prompt`
   - `process.env.GOOGLE_API_KEY` - Environment variable usage
   - `GoogleGenerativeAI` import statement
   - `try { } catch (error) { }` - Error handling blocks
   - Base64 image processing logic
3. **Error handling scenarios**: The function should handle:
   - GET requests (should return 405 Method Not Allowed)
   - Missing required fields (should return 400 Bad Request)
   - Missing API key (should return 500 Internal Server Error)
4. **Integration validation**: When possible with valid API key:
   - Test with realistic base64 user photo
   - Test with valid product image URL
   - Verify response contains `generatedImageUrl` field

### Testing API Endpoints Locally
- **Vercel dev server**: `vercel dev` (requires Vercel CLI authentication)
- **API endpoint**: `POST /api/generateImage`
- **Required payload**:
  ```json
  {
    "userPhoto": "data:image/jpeg;base64,..." or "base64string",
    "productImage": "https://example.com/product.jpg",
    "prompt": "Virtual try-on instructions for AI"
  }
  ```

## Deployment

### Vercel Deployment
- **Platform**: Vercel serverless functions
- **Configuration**: vercel.json defines build and routing
- **Environment setup**: Set GOOGLE_API_KEY in Vercel dashboard
- **Deploy command**: `vercel --prod` (requires authentication and project setup)

### Cost and Monitoring
- **Google AI cost**: Approximately $0.0005 per image generation
- **Monitor usage**: Google Cloud Console for API usage tracking
- **Vercel scaling**: Auto-scales based on demand

## Common Tasks and Commands

### Repository Commands (All under 1 second)
```bash
# Install dependencies (< 1 second)
npm install

# Validate syntax
node -c api/generateImage.js

# Check project structure
ls -la
# Expected output:
# .
# ..
# .git/
# .github/
# .gitignore
# api/
# package.json
# package-lock.json
# vercel.json
```

### Dependencies Overview
```bash
npm list
# Expected output:
# virtual-try-on-backend@1.0.0
# └── @google/generative-ai@0.1.3
```

### API Function Key Features
- **HTTP method restriction**: Only accepts POST requests
- **Input validation**: Validates userPhoto, productImage, and prompt fields  
- **Security**: API key stored in environment variables, never exposed to client
- **Image processing**: Handles base64 user photos and URL-based product images
- **AI integration**: Uses Google Gemini 1.5-flash model for image generation
- **Error handling**: Comprehensive try/catch with user-friendly error messages

## Critical Notes

### What Works
- **Dependency installation**: Works instantly with `npm install`
- **Syntax validation**: Works with `node -c api/generateImage.js`
- **Function structure**: Well-structured ES module with proper error handling
- **Vercel configuration**: Ready for serverless deployment

### What Requires Special Setup
- **Local testing**: Requires Vercel CLI authentication for dev server
- **Google API**: Requires valid GOOGLE_API_KEY environment variable
- **Full integration**: Needs network access for external image fetching

### What to Avoid
- **Do not commit node_modules** - it's in .gitignore
- **Do not hardcode API keys** - always use environment variables
- **Do not skip input validation** - function has comprehensive validation
- **Do not change ES module structure** - project uses "type": "module"

## Troubleshooting

### Common Issues
- **"require is not defined"**: Project uses ES modules, use import/export syntax
- **"API key not configured"**: Set GOOGLE_API_KEY environment variable
- **"Method not allowed"**: Function only accepts POST requests
- **Network errors**: Check internet connectivity for external image fetching

### When Making Changes
1. Always validate syntax with `node -c api/generateImage.js`
2. Test error handling paths (wrong method, missing fields, missing API key)
3. Ensure ES module compatibility (no require statements)
4. Validate environment variable usage
5. Test with realistic payload data when possible