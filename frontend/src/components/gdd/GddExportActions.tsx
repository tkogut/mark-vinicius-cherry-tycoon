import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Printer, FileDown } from 'lucide-react';
import { type GddSection } from '../../lib/gddTemplate';
import { downloadGddAsMarkdown } from '../../lib/gddExport';

interface GddExportActionsProps {
  sections: GddSection[];
}

export function GddExportActions({ sections }: GddExportActionsProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    downloadGddAsMarkdown(sections);
  };

  return (
    <div className="flex gap-2 print:hidden">
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Print / PDF</span>
        <span className="sm:hidden">Print</span>
      </Button>
      <Button onClick={handleDownloadMarkdown} variant="outline" size="sm" className="gap-2">
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">Download Markdown</span>
        <span className="sm:hidden">Download</span>
      </Button>
    </div>
  );
}
