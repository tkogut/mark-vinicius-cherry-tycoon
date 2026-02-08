import { usePlanInputState } from '../hooks/usePlanInputState';
import { GddSectionAccordion } from '../components/gdd/GddSectionAccordion';
import { GddExportActions } from '../components/gdd/GddExportActions';
import { SaveStatusBar } from '../components/gdd/SaveStatusBar';
import { Skeleton } from '@/components/ui/skeleton';

export default function GddPage() {
  const { mergedGdd, isDirty, isSaving, isSaved, isSaveError, saveToBackend, isLoadingData, isAuthenticated } = usePlanInputState();

  if (isLoadingData && isAuthenticated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 print:mb-8">
        <div className="flex items-start justify-between gap-4 mb-4 print:block">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2 print:text-4xl">
              Mark Vinicius Cherry Tycoon — Game Design Document
            </h1>
            <p className="text-muted-foreground text-sm">
              A comprehensive design document for a mobile-first farming and sports management tycoon game
            </p>
          </div>
          <div className="print:hidden">
            <GddExportActions sections={mergedGdd} />
          </div>
        </div>
      </div>

      <SaveStatusBar
        isAuthenticated={isAuthenticated}
        isDirty={isDirty}
        isSaving={isSaving}
        isSaved={isSaved}
        isSaveError={isSaveError}
        onSave={saveToBackend}
      />

      <GddSectionAccordion sections={mergedGdd} />
    </div>
  );
}
