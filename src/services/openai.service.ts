import OpenAI from 'openai';

// TODO: Configure OpenAI with environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateDesignSuggestion = async (prompt: string) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
        });
        return response.choices[0].message.content;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`OpenAI API Error: ${errorMessage}`);
    }
};

export const generateImage = async (prompt: string) => {
    try {
        const response = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });
        return response.data?.[0]?.url;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`OpenAI Image API Error: ${errorMessage}`);
    }
};

export default openai;
