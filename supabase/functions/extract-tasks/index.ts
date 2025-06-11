import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notes } = await req.json();

    // Split notes into sentences
    const sentences = notes.split(/[.!?]+/).filter(Boolean);

    // Extract action items
    const tasks = sentences
      .map(sentence => sentence.trim())
      .filter(sentence => {
        // Look for action verbs and task-like patterns
        const actionVerbs = ['create', 'update', 'write', 'review', 'send', 'prepare', 'finish', 'complete', 'implement', 'develop', 'fix', 'add', 'remove', 'change', 'organize', 'schedule', 'call', 'email', 'buy', 'make'];
        return actionVerbs.some(verb => sentence.toLowerCase().includes(verb));
      })
      .map(sentence => {
        // Extract priority and due date hints
        const urgentKeywords = ['urgent', 'asap', 'immediately', 'today', 'tomorrow'];
        const priority = urgentKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
          ? 'high'
          : 'medium';

        // Simple date extraction
        const datePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|((next|this) (week|month))|tomorrow|today/gi;
        const dateMatch = sentence.match(datePattern);
        
        let dueDate;
        if (dateMatch) {
          const date = new Date();
          if (dateMatch[0].includes('tomorrow')) {
            date.setDate(date.getDate() + 1);
            dueDate = date;
          } else if (dateMatch[0].includes('next week')) {
            date.setDate(date.getDate() + 7);
            dueDate = date;
          }
        }

        return {
          title: sentence,
          description: '',
          priority,
          category: 'personal',
          dueDate,
          completed: false,
        };
      });

    return new Response(
      JSON.stringify(tasks),
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
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});