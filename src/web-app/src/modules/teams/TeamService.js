const TeamService = {
    postTeam,
    fetchTeams
}

async function postTeam (newTeam) {
    try {
        const response = await fetch('http://localhost:8081/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTeam),
        });

        if (response.ok) {
            console.error('Team added:');
        } else {
            console.error('Error adding team:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding team:', error);
    }
}

async function fetchTeams () {
    try {
        const response = await fetch('http://localhost:8081/teams');

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching teams:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching teams:', error);
    }
}

export {TeamService};