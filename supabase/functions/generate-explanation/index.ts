import OpenAI from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function for logging
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = data 
    ? `[${timestamp}] ${message}: ${JSON.stringify(data)}\n`
    : `[${timestamp}] ${message}\n`;
  console.log(logMessage);
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    log('Handling OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    log('Processing request to generate explanation');

    // Log request details
    const url = new URL(req.url);
    log('Request details', {
      method: req.method,
      path: url.pathname,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Validate request data
    const requestData = await req.json().catch(() => null);
    if (!requestData || !requestData.question) {
      log('Invalid request data received', requestData);
      throw new Error('Invalid request data');
    }

    const { question, student_response } = requestData;
    log('Received request data', { question_text: question.question_text, correct_answer: question.correct_answer, options: question.options });

    // Validate OpenRouter API key
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      log('OpenRouter API key not found');
      throw new Error('OpenRouter API key not configured');
    }
    log('OpenRouter API key validated');

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openRouterKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'http://localhost:5173',
        'X-Title': 'Law Quiz App',
      },
    });
    log('OpenAI client initialized');

    // Generate explanation
    try {
      log('Calling OpenRouter API');
      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-4-maverick:free',
        messages: [
          {
            role: 'system',
            content: `You are a legal assistant that evaluates the responses of students to MCQ kind of questions. 
                      Your task is to explain why the correct answer is correct and the rest of the options are wrong.
                      Your response will be read by the student and must be directed to him/her.`,
          },
          {
            role: 'user',
            content: `Question: ${question.question_text}
            Options:
            ${question.options.map(opt => `${opt.id.toUpperCase()}. ${opt.text}`).join('\n')}
            Student's Answer: ${student_response}
            Correct Answer: ${question.correct_answer.toUpperCase()}
            `,
          },
        ],
      });

      const explanation = completion.choices[0]?.message?.content;
      if (!explanation) {
        log('No explanation content in API response');
        throw new Error('No explanation generated');
      }

      log('Successfully generated explanation');
      return new Response(
        JSON.stringify({ explanation }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (apiError) {
      log('OpenRouter API error', apiError);
      throw new Error(`OpenRouter API error: ${apiError.message}`);
    }
  } catch (error) {
    log('Error in edge function', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: error instanceof Error && error.message.includes('API key') ? 401 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});