const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function extractJsonBlock(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        throw new Error('Gemini returned an empty response');
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return trimmed;
    }

    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        return fencedMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf('{');
    const firstBracket = trimmed.indexOf('[');
    const jsonStartCandidates = [firstBrace, firstBracket].filter((index) => index >= 0);

    if (jsonStartCandidates.length === 0) {
        throw new Error('Gemini response did not contain JSON');
    }

    return trimmed.slice(Math.min(...jsonStartCandidates)).trim();
}

async function loadGeminiClient() {
    try {
        const geminiModule = await import('@google/generative-ai');
        return geminiModule.GoogleGenerativeAI;
    } catch {
        throw new Error('Gemini SDK is not installed. Run npm install in client/ to add @google/generative-ai.');
    }
}

export async function generateStructuredJson({ systemInstruction, prompt, schemaHint }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY environment variable');
    }

    const GoogleGenerativeAI = await loadGeminiClient();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction
    });

    const result = await model.generateContent([
        `${prompt}\n\nReturn valid JSON only. Do not include markdown fences.`,
        schemaHint ? `JSON schema hint:\n${schemaHint}` : ''
    ].filter(Boolean).join('\n\n'));

    const text = result.response.text();
    const jsonText = extractJsonBlock(text);
    return JSON.parse(jsonText);
}
