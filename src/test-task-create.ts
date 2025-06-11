import { supabase } from './lib/supabase';

async function testTaskCreation() {
  console.log('Testing task creation...');
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }

    if (!session) {
      console.log('No active session found, cannot create task');
      return;
    }

    console.log('Session user:', session.user.id);

    // Try creating a task
    const testTask = {
      title: 'Test task ' + new Date().toISOString(),
      description: 'This is a test task',
      created_by: session.user.id,
      created_at: new Date().toISOString()
    };

    console.log('Creating test task:', testTask);

    const { data, error } = await supabase
      .from('tasks')
      .insert([testTask])
      .select();

    if (error) {
      console.error('Error creating task:', error);
      return;
    }

    console.log('Task created successfully:', data);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testTaskCreation();
