import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GameDesignPlan, GameDesignDocument, UserGameData, UserRole } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetUserGameData() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserGameData | null>({
    queryKey: ['userGameData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserGameData();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveUserGameData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planInput, gddDraft }: { planInput: GameDesignPlan; gddDraft: GameDesignDocument }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveUserGameData(planInput, gddDraft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGameData'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}
