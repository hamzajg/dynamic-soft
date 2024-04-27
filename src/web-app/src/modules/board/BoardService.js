const BoardService = {
    postBoard,
    putBoard,
    fetchBoards
}

async function postBoard(newBoard) {
    try {
        const response = await fetch('http://localhost:8081/boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBoard),
        });

        if (response.ok) {
            console.error('Board added:');
        } else {
            console.error('Error adding board:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding board:', error);
    }
}

async function putBoard(updatedBoard) {
    try {
        const response = await fetch(`http://localhost:8081/boards/${updatedBoard.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedBoard),
        });

        if (response.ok) {
            console.error('Board added:');
        } else {
            console.error('Error adding board:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding board:', error);
    }
}

async function fetchBoards() {
    try {
        const response = await fetch('http://localhost:8081/boards');
        if (response.ok) {
            return await response.json()
        } else {
            console.error('Error fetching boards:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

export {BoardService}
