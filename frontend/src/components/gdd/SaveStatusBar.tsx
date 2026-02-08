import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

interface SaveStatusBarProps {
  isAuthenticated: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isSaved: boolean;
  isSaveError: boolean;
  onSave: () => void;
}

export function SaveStatusBar({ isAuthenticated, isDirty, isSaving, isSaved, isSaveError, onSave }: SaveStatusBarProps) {
  if (!isAuthenticated) {
    return (
      <Alert className="mb-6 border-[oklch(0.75_0.15_30)] bg-[oklch(0.75_0.15_30)]/10">
        <Lock className="h-4 w-4 text-[oklch(0.65_0.18_15)]" />
        <AlertDescription className="text-sm">
          <strong>Login required to save:</strong> Your work is being edited in-memory. Login to save your GDD and Plan Input to your account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-card border border-border rounded-lg print:hidden">
      <div className="flex items-center gap-2 text-sm">
        {isSaving && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Saving...</span>
          </>
        )}
        {isSaved && !isDirty && (
          <>
            <CheckCircle2 className="w-4 h-4 text-[oklch(0.65_0.18_15)]" />
            <span className="text-[oklch(0.65_0.18_15)]">All changes saved</span>
          </>
        )}
        {isDirty && !isSaving && (
          <>
            <AlertCircle className="w-4 h-4 text-[oklch(0.75_0.15_30)]" />
            <span className="text-muted-foreground">Unsaved changes</span>
          </>
        )}
        {isSaveError && (
          <>
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive">Error saving</span>
          </>
        )}
      </div>
      <Button onClick={onSave} disabled={!isDirty || isSaving} size="sm" className="gap-2">
        <Save className="w-4 h-4" />
        Save to Account
      </Button>
    </div>
  );
}
