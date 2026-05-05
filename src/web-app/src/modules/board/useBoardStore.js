import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBoardStore = create(
  persist(
    (set) => ({
      boards: [],
      addBoard: (board) => set((state) => ({ boards: [...state.boards, { ...board, createdAt: new Date().toISOString() }] })),
      updateBoard: (updatedBoard) => set((state) => ({
        boards: state.boards.map(b => b.id === updatedBoard.id ? { ...b, ...updatedBoard, updatedAt: new Date().toISOString() } : b)
      })),
      setBoards: (boards) => set({ boards }),
    }),
    {
      name: 'board-storage',
    }
  )
);

export default useBoardStore;
