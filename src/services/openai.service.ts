import { Configuration, OpenAIApi } from 'openai';

// TODO: Configure OpenAI with environment variables
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateDesignSuggestion = async (prompt) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 150,
        });
        return response.data.choices[0].text;
    } catch (error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
    }
};

export const generateImage = async (prompt) => {
    try {
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });
        return response.data.data[0].url;
    } catch (error) {
        throw new Error(`OpenAI Image API Error: ${error.message}`);
    }
};

export default openai;
