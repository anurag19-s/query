// backend/services/llmService.js (Groq version)
const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

async function getLLMSuggestion(currentIssue, similarTickets) {
  const examplesText = similarTickets
    .map((t, i) => {
      const lastComment = t.comments[t.comments.length - 1];
      return `Example ${i + 1}:
Issue: ${t.title} - ${t.description}
Department: ${t.department}
Resolution: ${lastComment?.text || "Resolved by department."}`;
    })
    .join("\n\n");

  const prompt = `You are a helpful assistant for a college helpdesk.

Current student issue:
"${currentIssue}"

Here are similar past tickets and how they were resolved:
${examplesText || "No similar tickets found."}

Task:
1. Suggest a clear, practical solution for the student (2-4 sentences).
2. Choose the most appropriate department from: Academics, Hostel, Library, IT, Administration, Sports, Transport.

Respond ONLY in JSON format:
{
  "suggestion": "your suggestion here",
  "department": "one of the above"
}`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful college helpdesk assistant. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = response.choices[0].message.content.trim();
    
    // Clean up response in case it has markdown code blocks
    let cleanText = text
      .replace(/```json\n?/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const json = JSON.parse(cleanText);
    return json;
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw error;
  }
}

module.exports = { getLLMSuggestion };