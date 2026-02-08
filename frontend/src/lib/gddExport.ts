import { GddSection } from './gddTemplate';

/**
 * Exports GDD sections to Markdown format.
 * Preserves all formatting including formulas, code blocks, and Polish terminology.
 */
export function exportGddToMarkdown(sections: GddSection[]): string {
  let markdown = '# Mark Vinicius Cherry Tycoon - Game Design Document\n\n';
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  markdown += '---\n\n';

  sections.forEach((section, index) => {
    // Add section with proper heading level
    markdown += `## ${index + 1}. ${section.title}\n\n`;
    
    // Add content - preserve all formatting including code blocks and formulas
    markdown += `${section.content}\n\n`;
    
    // Add separator between sections
    if (index < sections.length - 1) {
      markdown += '---\n\n';
    }
  });

  // Add footer
  markdown += '\n---\n\n';
  markdown += '*This Game Design Document was generated using the Mark Vinicius Cherry Tycoon GDD Tool.*\n';
  markdown += '*Built with ❤️ using [caffeine.ai](https://caffeine.ai)*\n';

  return markdown;
}

/**
 * Downloads the GDD as a Markdown file.
 */
export function downloadGddAsMarkdown(sections: GddSection[], filename: string = 'mark-vinicius-cherry-tycoon-gdd.md'): void {
  const markdown = exportGddToMarkdown(sections);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
