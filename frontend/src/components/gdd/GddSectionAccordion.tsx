import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { type GddSection } from '../../lib/gddTemplate';

interface GddSectionAccordionProps {
  sections: GddSection[];
}

export function GddSectionAccordion({ sections }: GddSectionAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="space-y-4">
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id} className="border-none">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50 transition-colors rounded-t-lg">
              <h2 className="text-lg font-semibold text-left">{section.title}</h2>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-4 pb-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="whitespace-pre-wrap text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: section.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/^(.+)$/gm, '<p>$1</p>')
                        .replace(/<p><\/p>/g, '')
                        .replace(/\[Plan Input Needed\]/g, '<span class="text-[oklch(0.65_0.18_15)] font-semibold">[Plan Input Needed]</span>'),
                    }}
                  />
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
