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
    const { question, studentResponse, correctAnswer } = await req.json();

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const completion = await openai.chat.completions.create({
      model: 'meta-llama/llama-4-maverick:free',
      messages: [
        {
          role: 'system',
          content: `You are a helpful legal assistant that provides explanation to student responses on fill in the blank questions as they prepare for their exams.
          You will be provided with a student response and the correct answer. Your task is to explain why the correct answer is correct and the student's answer is wrong (for cases they don't match). For cases where the student's response
          is correct and matches the correct answer, just explain why that response is correct. Your response will be read by the student and must be directed to them.`
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nStudent Response: ${studentResponse}\n\nCorrect Answer: ${correctAnswer}`
        }
      ]
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