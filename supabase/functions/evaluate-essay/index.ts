import OpenAI from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { question, studentResponse, keyPoints } = await req.json();

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const completion = await openai.chat.completions.create({
      model: 'meta-llama/llama-4-maverick:free',
      messages: [
        {
          role: 'system',
          content: `You are a helpful legal assistant that analyses student responses to essay type questions as they prepare for their exams.
          You will be provided with a student response and the key points expected in the right answer. You are to provide feedback to the student on their response and also provide a score out of 10 for the response. The score should be based on the content of the response, how it addresses the key points provided, and the clarity of the response. The feedback should be constructive and should help the student improve their response. Your response will be read by the student and must be directed to them.`
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nStudent Response: ${studentResponse}\n\nKey Points: ${keyPoints || 'None provided'}`
        }
      ],
      response_format: {
        type: "json_object",
        schema: {
          type: "object",
          properties: {
            score: {
              type: "integer",
              description: "The score out of 10 for the student response."
            },
            explanation: {
              type: "string",
              description: "The feedback for the student."
            }
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ explanation: completion.choices[0].message.content }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});