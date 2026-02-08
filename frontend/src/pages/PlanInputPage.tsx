import { usePlanInputState } from '../hooks/usePlanInputState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Sparkles, FileText } from 'lucide-react';
import { SaveStatusBar } from '../components/gdd/SaveStatusBar';

export default function PlanInputPage() {
  const { planInput, updatePlanInput, applyToGdd, isDirty, isSaving, isSaved, isSaveError, saveToBackend, isAuthenticated } = usePlanInputState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Plan Input Editor</h1>
        <p className="text-muted-foreground">
          Provide details about your game plan to populate the GDD template with specific information.
        </p>
      </div>

      <SaveStatusBar
        isAuthenticated={isAuthenticated}
        isDirty={isDirty}
        isSaving={isSaving}
        isSaved={isSaved}
        isSaveError={isSaveError}
        onSave={saveToBackend}
      />

      <Alert className="border-[oklch(0.75_0.15_30)] bg-[oklch(0.75_0.15_30)]/10">
        <Sparkles className="h-4 w-4 text-[oklch(0.65_0.18_15)]" />
        <AlertDescription className="text-sm">
          Fill in the fields below to replace <strong>[Plan Input Needed]</strong> placeholders in the GDD. Changes apply automatically to the GDD view.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Raw Plan Content
          </CardTitle>
          <CardDescription>
            Paste your complete game plan document here. This will be used as additional context for plan-dependent sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={planInput.rawPlanText}
            onChange={(e) => updatePlanInput({ rawPlanText: e.target.value })}
            placeholder="Paste your game plan document here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Structured Fields</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Fill in these key parameters to automatically populate specific sections of the GDD.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setting & Lore</CardTitle>
              <CardDescription>Game concept, world setting, and narrative elements</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planInput.settingAndLore}
                onChange={(e) => updatePlanInput({ settingAndLore: e.target.value })}
                placeholder="e.g., A whimsical world where cherry farming meets competitive sports..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Economy Constraints</CardTitle>
              <CardDescription>Monetization targets, balance goals, and economic parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planInput.economyConstraints}
                onChange={(e) => updatePlanInput({ economyConstraints: e.target.value })}
                placeholder="e.g., ARPPU: $15, Conversion: 3%, D1/D7/D30: 45%/25%/12%..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crop List</CardTitle>
              <CardDescription>Types of cherries and other crops available in the game</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planInput.cropList}
                onChange={(e) => updatePlanInput({ cropList: e.target.value })}
                placeholder="e.g., Bing Cherry, Rainier Cherry, Morello Cherry, Golden Cherry..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sports League Format</CardTitle>
              <CardDescription>Sport type, league structure, team size, and competition format</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planInput.sportsLeagueFormat}
                onChange={(e) => updatePlanInput({ sportsLeagueFormat: e.target.value })}
                placeholder="e.g., Soccer, 11 players per team, 4 divisions with promotion/relegation..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Token/NFT Intentions</CardTitle>
              <CardDescription>Web3 features, NFT plans, and blockchain integration details</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planInput.tokenNftIntentions}
                onChange={(e) => updatePlanInput({ tokenNftIntentions: e.target.value })}
                placeholder="e.g., NFT legendary players, tradable rare crops, cosmetic items only..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progression Goals</CardTitle>
              <CardDescription>Pacing targets, content velocity, and milestone timings</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planInput.progressionGoals}
                onChange={(e) => updatePlanInput({ progressionGoals: e.target.value })}
                placeholder="e.g., Level 10 in 3 days, first league win in 1 week, new content bi-weekly..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Alert className="max-w-md border-[oklch(0.65_0.18_15)] bg-[oklch(0.65_0.18_15)]/10">
          <CheckCircle2 className="h-4 w-4 text-[oklch(0.65_0.18_15)]" />
          <AlertDescription className="text-sm">
            Changes are applied automatically to the GDD. Switch to the <strong>GDD</strong> tab to see your updates.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
