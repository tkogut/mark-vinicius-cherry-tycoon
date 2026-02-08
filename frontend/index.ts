export function useAssignParcelToPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parcelId, playerId }: { parcelId: string; playerId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.assignParcelToPlayer(parcelId, playerId);
      if (result.__kind__ === 'ok') {
        return result.ok;
      }
      throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
    },
  });
}
