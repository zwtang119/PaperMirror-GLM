import type { AnalysisReport, StyleGuide, DocumentContext } from '../types';
import { inferencePrompts, documentContextPrompt } from './prompts';
import { glmConfig } from './config';

// Initialize the API key from environment variables
const apiKey = import.meta.env.VITE_GLM_API_KEY;

if (!apiKey) {
    console.error("❌ Fatal Error: GLM API Key is missing. Please check your .env file.");
}

// GLM API endpoint
const API_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// Type definitions for GLM API
interface GLMMessage {
    role: "system" | "user" | "assistant";
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface GLMRequest {
    model: string;
    messages: GLMMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    top_p?: number;
    thinking?: { type: string };
    response_format?: { type: string };
}

interface GLMResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// --- CORE GENERATION FUNCTION with enhanced debugging ---

async function generateData<T>(
    prompt: string, 
    systemInstruction: string
): Promise<T> {
    let text = '';
    
    try {
        const messages: GLMMessage[] = [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ];

        const requestBody: GLMRequest = {
            model: glmConfig.modelName,
            messages: messages,
            temperature: glmConfig.temperature,
            max_tokens: glmConfig.maxTokens,
            stream: false,
            top_p: glmConfig.topP,
            thinking: glmConfig.thinkingEnabled ? { type: "enabled" } : { type: "disabled" },
            response_format: { type: "json_object" }
        };

        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`GLM API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
        }

        const data: GLMResponse = await response.json();
        text = data.choices[0]?.message?.content || '';
        
        if (!text) {
            throw new Error("GLM API returned empty response text.");
        }

        // ==== 增强的 JSON 清理逻辑 ====
        console.log("Raw GLM response length:", text.length);
        console.log("Raw GLM response:", text.substring(0, 500) + "..."); // 打印前500字符
        
        // 移除 Markdown 代码块标记
        text = text.trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '');
        
        // 提取第一个 '{' 和最后一个 '}' 之间的内容
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            text = text.substring(firstOpen, lastClose + 1);
        }
        
        // 验证 JSON 结构完整性
        if (!text.startsWith('{') || !text.endsWith('}')) {
            throw new Error(`Invalid JSON structure: must start with '{' and end with '}'. Cleaned text: ${text.substring(0, 100)}...`);
        }
        
        // 尝试解析
        return JSON.parse(text) as T;
        
    } catch (error) {
        console.error("GLM Generation Error:", error);
        
        // 现在可以正确访问 text 变量
        console.error("Failed Text Payload:", text);
        
        if (error instanceof SyntaxError) {
            throw new Error(`JSON Parse Error: ${error.message}. Failed to parse: ${text.substring(0, 200)}...`);
        }
        
        throw error;
    }
}

// --- EXPORTS ---

export const generateDocumentContext = async (fullDocumentContent: string): Promise<DocumentContext> => {
    const { systemInstruction, getPrompt } = documentContextPrompt;
    const prompt = getPrompt(fullDocumentContent);
    return generateData<DocumentContext>(prompt, systemInstruction);
};

export const extractStyleGuide = async (samplePaperContent: string): Promise<StyleGuide> => {
    const { systemInstruction, getPrompt } = inferencePrompts.extractStyleGuide;
    const prompt = getPrompt(samplePaperContent);
    return generateData<StyleGuide>(prompt, systemInstruction);
};

export const rewriteChunkInInferenceMode = async (params: {
    mainContent: string;
    contextBefore: string;
    contextAfter: string;
    styleGuide: StyleGuide;
    documentContext: DocumentContext;
    currentSectionTitle?: string;
}): Promise<{ conservative: string; standard: string; enhanced: string; }> => {
    const { systemInstruction, getPrompt } = inferencePrompts.rewriteChunk;
    const prompt = getPrompt(params);
    return generateData<{ conservative: string; standard: string; enhanced: string; }>(prompt, systemInstruction);
};

export const generateFinalReport = async (params: {
    sampleStyleGuide: StyleGuide,
    originalDraftContent: string,
    rewrittenStandardContent: string
}): Promise<AnalysisReport> => {
    const { systemInstruction, getPrompt } = inferencePrompts.generateFinalReport;
    const prompt = getPrompt(params);
    return generateData<AnalysisReport>(prompt, systemInstruction);
};