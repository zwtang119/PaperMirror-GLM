# GLM API Integration Guide

This document provides instructions on how to integrate PaperMirror with the GLM-4.5-Air model.

## Setup

1. Get your API key from [https://open.bigmodel.cn/](https://open.bigmodel.cn/)
2. Copy `.env.example` to `.env` and add your API key:
   ```
   VITE_GLM_API_KEY=your_glm_api_key_here
   ```

## API Configuration

The GLM service is configured in `services/config.ts` with the following parameters:

- **Model**: `glm-4.5-air` - Efficient model for academic text processing
- **Temperature**: 0.2 - Lower temperature for consistent academic writing style
- **Max Tokens**: 8192 - Maximum number of tokens to generate
- **Top-p**: 0.9 - Nucleus sampling parameter
- **Thinking**: Enabled - Deeper reasoning for complex tasks

## API Parameters

The GLM API supports the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| model | string | glm-4.5-air | Model name to use |
| messages | array | - | Array of message objects |
| temperature | number | 0.2 | Controls randomness (0-1) |
| max_tokens | number | 8192 | Maximum tokens to generate |
| stream | boolean | false | Whether to stream responses |
| top_p | number | 0.9 | Nucleus sampling parameter |
| thinking | object | {type: "enabled"} | Thinking mode configuration |

## Migration from Gemini

The project has been migrated from Google Gemini to GLM-4.5-Air. The main changes include:

1. New service file: `services/glmService.ts`
2. Updated configuration in `services/config.ts`
3. Changed environment variable from `VITE_GEMINI_API_KEY` to `VITE_GLM_API_KEY`
4. Removed `@google/genai` dependency from package.json

## Testing

To test the integration:

1. Set up your environment variables
2. Run the development server: `npm run dev`
3. Upload a sample paper and a draft to test the style transfer functionality

## Troubleshooting

If you encounter issues:

1. Check that your API key is correctly set in the `.env` file
2. Verify your API key has sufficient credits
3. Check the browser console for error messages
4. Ensure all environment variables are properly configured