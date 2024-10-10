 const axios = require('axios');

const generatePuzzle = async () => {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: "Generate a space-themed riddle or trivia question.",
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.7,
    }, {
        headers: {
           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
       },
    });
   return response.data.choices[0].text.trim();
};

module.exports = { generatePuzzle };