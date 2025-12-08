
export const glmConfig = {
  /**
   * The name of the GLM model to be used for all API calls.
   * Changed to 'glm-4.5-flash' for free usage.
   */
  modelName: 'glm-4.5-flash',

  /**
   * The temperature setting for the model.
   * Lower temperature for more consistent academic writing style.
   */
  temperature: 0.2,

  /**
   * Maximum number of tokens to generate in the response.
   * GLM-4.5-air supports up to 98304 tokens.
   */
  maxTokens: 8192,

  /**
   * Top-p sampling parameter for nucleus sampling.
   * Controls diversity through cumulative probability threshold.
   */
  topP: 0.9,

  /**
   * Whether to enable thinking mode for deeper reasoning.
   * GLM-4.5-air supports thinking mode for complex tasks.
   */
  thinkingEnabled: false,
};

// Legacy export for backward compatibility
export const geminiConfig = glmConfig;
