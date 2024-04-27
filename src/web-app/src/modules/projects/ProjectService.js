const ProjectService = {
    postProject,
    fetchProjects
}

async function postProject(newProject){
    try {
        const response = await fetch('http://localhost:8081/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProject),
        });

        if (response.ok) {
            console.error('Project added:');
        } else {
            console.error('Error adding project:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding project:', error);
    }
}

async function fetchProjects(){
    try {
        const response = await fetch('http://localhost:8081/projects');

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching projects:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

export {ProjectService};
