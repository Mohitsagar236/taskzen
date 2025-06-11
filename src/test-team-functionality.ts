// Test file for team functionality
import { useTeamStore } from './store/teamStore';
import { fetchUserTeams, createTeam } from './lib/teamsClient';
import { inviteTeamMember, updateMemberRole, removeTeamMember } from './lib/teamMembersClient';
import { Team, TeamMember } from './types/team';

/**
 * Test the team functionality
 */
export async function testTeamFunctionality() {
  console.log('Testing team functionality...');
  
  try {
    // 1. Fetch teams
    console.log('Fetching teams...');
    const teamsResponse = await fetchUserTeams();
    console.log(`Fetched ${teamsResponse.teams.length} teams`);
    
    // 2. Create a new team
    console.log('Creating a test team...');
    const teamName = `Test Team ${new Date().toISOString()}`;
    const { team: newTeam } = await createTeam({
      name: teamName,
      description: 'This is a test team created by the test script'
    });
    console.log('Created team:', newTeam);
    
    // 3. Wait a moment for the database to propagate the change
    console.log('Waiting for database to propagate changes...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Fetch teams again to verify the new team was created
    const updatedTeamsResponse = await fetchUserTeams();
    const createdTeam = updatedTeamsResponse.teams.find(t => t.id === newTeam.id);
    console.log('Team exists in updated fetch:', !!createdTeam);
    
    // 5. Try to invite a member (this may fail if the email doesn't exist)
    if (createdTeam) {
      try {
        console.log('Inviting a test member...');
        await inviteTeamMember(
          createdTeam.id,
          'test@example.com', // Replace with a real email that exists in your system
          'editor'
        );
        console.log('Invited member successfully');
      } catch (inviteError) {
        console.error('Error inviting member:', inviteError);
      }
    }
    
    return {
      success: true,
      message: 'Team functionality test completed',
      teamsCount: updatedTeamsResponse.teams.length,
      createdTeam: newTeam
    };
  } catch (error) {
    console.error('Team functionality test failed:', error);
    return {
      success: false,
      message: 'Team functionality test failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Execute the test if this file is run directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test-teams')) {
  testTeamFunctionality()
    .then(result => {
      console.log('Test result:', result);
      document.body.innerHTML = `
        <h1>Team Functionality Test</h1>
        <pre>${JSON.stringify(result, null, 2)}</pre>
      `;
    })
    .catch(error => {
      console.error('Error running test:', error);
      document.body.innerHTML = `
        <h1>Team Functionality Test Error</h1>
        <pre>${error instanceof Error ? error.stack : String(error)}</pre>
      `;
    });
}
