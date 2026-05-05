import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BoardService } from './BoardService';
import useBoardStore from './useBoardStore';

export const useBoards = () => {
    const { setBoards } = useBoardStore();

    return useQuery({
        queryKey: ['boards'],
        queryFn: async () => {
            const data = await BoardService.fetchBoards();
            setBoards(data);
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAddBoard = () => {
    const queryClient = useQueryClient();
    const addBoardStore = useBoardStore((state) => state.addBoard);

    return useMutation({
        mutationFn: BoardService.postBoard,
        onSuccess: (newBoard) => {
            queryClient.invalidateQueries(['boards']);
        },
        onMutate: (newBoard) => {
            addBoardStore(newBoard);
        }
    });
};

export const useUpdateBoard = () => {
    const queryClient = useQueryClient();
    const updateBoardStore = useBoardStore((state) => state.updateBoard);

    return useMutation({
        mutationFn: BoardService.putBoard,
        onSuccess: () => {
            queryClient.invalidateQueries(['boards']);
        },
        onMutate: (updatedBoard) => {
            updateBoardStore(updatedBoard);
        }
    });
};
