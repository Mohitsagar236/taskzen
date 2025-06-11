import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    // Simple keyword-based analysis
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'deadline'];
    const importantKeywords = ['important', 'priority', 'crucial', 'significant'];
    
    const text = `${title} ${description}`.toLowerCase();
    
    let priority = 'medium';
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      priority = 'high';
    } else if (importantKeywords.some(keyword => text.includes(keyword))) {
      priority = 'medium';
    }

    // Extract date patterns
    const datePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|((next|this) (week|month))|tomorrow|today/gi;
    const dateMatch = text.match(datePattern);
    
    let suggestedDueDate = null;
    if (dateMatch) {
      // Simple date parsing logic
      const date = new Date();
      if (dateMatch[0].includes('tomorrow')) {
        date.setDate(date.getDate() + 1);
      } else if (dateMatch[0].includes('next week')) {
        date.setDate(date.getDate() + 7);
      } else if (dateMatch[0].includes('next month')) {
        date.setMonth(date.getMonth() + 1);
      }
      suggestedDueDate = date.toISOString().split('T')[0];
    }

    // Category suggestion based on keywords
    const categoryKeywords = {
      work: ['meeting', 'project', 'deadline', 'client', 'presentation'],
      personal: ['home', 'family', 'hobby', 'personal'],
      shopping: ['buy', 'purchase', 'shop', 'store', 'groceries'],
      health: ['exercise', 'workout', 'doctor', 'medicine', 'health'],
    };

    let suggestedCategory = 'personal';
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        suggestedCategory = category;
        break;
      }
    }

    return new Response(
      JSON.stringify({
        priority,
        suggestedDueDate,
        suggestedCategory,
      }),
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