const BASE_URL = 'http://localhost:8081/boards';

const BoardService = {
    postBoard: async (newBoard) => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBoard),
        });
        if (!response.ok) throw new Error('Failed to post board');
        return response.json();
    },
    putBoard: async (updatedBoard) => {
        const response = await fetch(`${BASE_URL}/${updatedBoard.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBoard),
        });
        if (!response.ok) throw new Error('Failed to update board');
        return response.json();
    },
    fetchBoards: async () => {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch boards');
        return response.json();
    }
};

export { BoardService };
