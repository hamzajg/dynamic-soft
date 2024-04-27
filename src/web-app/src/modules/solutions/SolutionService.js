const SolutionService = {
    postSolution,
    fetchSolutions,
    callSwaggerCodeGen
}

async function postSolution(newSolution) {
    try {
        const response = await fetch('http://localhost:8081/solutions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSolution),
        });

        if (response.ok) {
            console.error('Solution added:');
        } else {
            console.error('Error adding solution:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding solution:', error);
    }
}

async function fetchSolutions() {
    try {
        const response = await fetch('http://localhost:8081/solutions');

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching solutions:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching solutions:', error);
    }
}

async function callSwaggerCodeGen(metadata) {
    try {
        const response = await fetch('http://localhost:8081/generators', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata),
        });

        if (response.ok) {
            return response.blob();
            console.error('Project generated:');
        } else {
            console.error('Error generating project:', response.statusText);
        }
    } catch (error) {
        console.error('Error generating project:', error);
    }
}

export {SolutionService};