import { useState, useCallback, useEffect } from 'react';
import { type PlanInputFields, defaultPlanInput, parsePlanInput } from '../lib/planInputSchema';
import { type GddSection, gddTemplate } from '../lib/gddTemplate';
import { mergeGddWithPlanInput } from '../lib/gddMerge';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetUserGameData, useSaveUserGameData } from './useQueries';

export function usePlanInputState() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [planInput, setPlanInput] = useState<PlanInputFields>(defaultPlanInput);
  const [mergedGdd, setMergedGdd] = useState<GddSection[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { data: savedData, isLoading: isLoadingData } = useGetUserGameData();
  const { mutate: saveData, isPending: isSaving, isSuccess: isSaved, isError: isSaveError } = useSaveUserGameData();

  // Hydrate from saved data when authenticated
  useEffect(() => {
    if (savedData && isAuthenticated) {
      const loadedPlanInput: PlanInputFields = {
        rawPlanText: savedData.planInput.description || '',
        settingAndLore: savedData.planInput.title || '',
        economyConstraints: savedData.planInput.monetizationStrategy || '',
        cropList: savedData.planInput.coreMechanics || '',
        sportsLeagueFormat: savedData.planInput.genre || '',
        tokenNftIntentions: savedData.planInput.platform || '',
        progressionGoals: savedData.planInput.targetAudience || '',
      };
      setPlanInput(loadedPlanInput);
      setIsDirty(false);
    }
  }, [savedData, isAuthenticated]);

  // Apply plan input to GDD
  const applyToGdd = useCallback(() => {
    const parsedInput = parsePlanInput(planInput);
    const merged = mergeGddWithPlanInput(gddTemplate, parsedInput);
    setMergedGdd(merged);
  }, [planInput]);

  // Auto-apply on mount and when plan input changes
  useEffect(() => {
    applyToGdd();
  }, [applyToGdd]);

  const updatePlanInput = useCallback((updates: Partial<PlanInputFields>) => {
    setPlanInput((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const saveToBackend = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    const planInputData = {
      title: planInput.settingAndLore,
      description: planInput.rawPlanText,
      genre: planInput.sportsLeagueFormat,
      targetAudience: planInput.progressionGoals,
      coreMechanics: planInput.cropList,
      platform: planInput.tokenNftIntentions,
      monetizationStrategy: planInput.economyConstraints,
    };

    const gddDraftData = {
      executiveSummary: mergedGdd.find((s) => s.id === 'executive-summary')?.content || '',
      gameplayDetails: mergedGdd.find((s) => s.id === 'core-loops')?.content || '',
      technicalSpecifications: mergedGdd.find((s) => s.id === 'technical-architecture')?.content || '',
      marketingPlan: mergedGdd.find((s) => s.id === 'target-audience')?.content || '',
      projectTimeline: mergedGdd.find((s) => s.id === 'content-plan')?.content || '',
    };

    saveData(
      { planInput: planInputData, gddDraft: gddDraftData },
      {
        onSuccess: () => {
          setIsDirty(false);
        },
      }
    );
  }, [isAuthenticated, planInput, mergedGdd, saveData]);

  return {
    planInput,
    updatePlanInput,
    mergedGdd,
    applyToGdd,
    saveToBackend,
    isDirty,
    isSaving,
    isSaved,
    isSaveError,
    isLoadingData,
    isAuthenticated,
  };
}
