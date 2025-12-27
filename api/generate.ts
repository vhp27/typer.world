// Vercel Serverless Function - AI Text Generation (Gemini API)
// Implementation: Server-Side Pooling (Shared Cache)
// Strategy: 1 API Call -> 5 Variations -> Stored in Global Pool -> Served 1-by-1
// optimization: Delimiter parsing for reliability
// Last Updated: 2025-12-27

import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    runtime: 'edge',
};

// --- CONFIGURATION ---
const BATCH_SIZE = 5;


// --- GLOBAL STATE ---
// This map persists across requests on a "Warm" lambda instance.
// In 'vercel dev', this clears on file change, but persists during runtime.
interface TextPool {
    items: string[];
    timestamp: number;
}
const serverPools = new Map<string, TextPool>();

function getPoolKey(wordCount: number, topic: string = 'general', style: string = 'casual'): string {
    return `${wordCount}-${topic.toLowerCase().trim()}-${style}`;
}

// Model Priority
const PRIMARY_MODEL = 'gemma-3-27b-it';
const FALLBACK_MODEL = 'gemma-3-12b-it';

// --- GENERATION LOGIC ---
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 503 });
    }

    try {
        const body = await request.json();
        const { wordCount = 50, topic, style = 'casual' } = body;
        const poolKey = getPoolKey(wordCount, topic, style);

        // 1. Initialize logic
        if (!serverPools.has(poolKey)) {
            serverPools.set(poolKey, { items: [], timestamp: Date.now() });
        }
        const pool = serverPools.get(poolKey)!;

        // 2. CHECK POOL
        if (pool.items.length > 0) {
            const text = pool.items.shift(); // FIFO
            console.log(`[Server Pool] Served from memory. Remaining: ${pool.items.length}`);
            return successResponse(text!, pool.items.length);
        }

        // 3. GENERATE BATCH (If Empty)
        console.log(`[Server Pool] Empty! Generating batch of ${BATCH_SIZE}...`);
        const newTexts = await generateBatch(apiKey, wordCount, topic, style);

        // Save to pool
        pool.items.push(...newTexts);
        pool.timestamp = Date.now();

        // Serve one
        const text = pool.items.shift();

        return successResponse(text || "Error", pool.items.length);

    } catch (e: any) {
        console.error('[API Error]', e);
        return new Response(JSON.stringify({
            error: e.message || 'Internal Server Error'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

// --- HELPER FUNCTIONS ---

function successResponse(text: string, remaining: number) {
    return new Response(JSON.stringify({
        text,
        poolRemaining: remaining
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Low-Tech Robust Batch Generation
async function generateBatch(apiKey: string, wordCount: number, topic: string, style: string): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const delimiter = "|||";

    // We request CLEAN text. No formatting. Punctuation/Symbols handled by client if desired.
    const instructions = `You are a typing practice generator.
Generate ${BATCH_SIZE} distinct ${wordCount}-word typing practice passages.
Topic: ${topic || 'General Knowledge'}. 
Style: ${style}.

STRICT FORMATTING RULES:
1. Do NOT use JSON.
2. Separate each passage with exactly "${delimiter}".
3. Do not include any intro text, titles, or numbering.
4. Just the raw passages separated by the delimiter.
5. Plain text only.`;

    try {
        return await attemptGeneration(genAI, PRIMARY_MODEL, instructions, delimiter);
    } catch {
        console.warn(`[Gemini] Primary ${PRIMARY_MODEL} failed, trying ${FALLBACK_MODEL}`);
        return await attemptGeneration(genAI, FALLBACK_MODEL, instructions, delimiter);
    }
}

async function attemptGeneration(genAI: GoogleGenerativeAI, modelId: string, prompt: string, delimiter: string): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Empty AI response");

    const parts = text.split(delimiter)
        .map(p => p.trim())
        .filter(p => p.length > 20); // Basic validation

    if (parts.length > 0) return parts;
    if (text.length > 50) return [text.trim()]; // Fallback single

    throw new Error("Failed to parse AI response");
}
