import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CodeViewer } from '../../shared/code-viewer/code-viewer';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { analyze, modernityScore } from './ai-code-analyzer';
import { EXAMPLES } from './ai-examples';
import { SNIPPETS } from './review-ai-code.snippets';
import { SOURCES } from './sources.generated';

/** Video 025 – Reviewing AI-generated Angular code with a rule-based checker. */
@Component({
  selector: 'app-review-ai-code-page',
  imports: [CodeViewer, DemoPage, MatButtonModule, MatIconModule, MetricTile],
  templateUrl: './review-ai-code.page.html',
  styleUrl: './review-ai-code.page.scss',
})
export class ReviewAiCodePage {
  readonly snippets = SNIPPETS;
  readonly examples = EXAMPLES;
  readonly mcpConfig = SOURCES['.mcp.json'] ?? '';

  readonly code = signal(EXAMPLES[0]?.code ?? '');
  readonly findings = computed(() => analyze(this.code()));
  readonly score = computed(() => modernityScore(this.findings()));
  readonly counts = computed(() => {
    const f = this.findings();
    return {
      high: f.filter((x) => x.severity === 'high').length,
      medium: f.filter((x) => x.severity === 'medium').length,
      low: f.filter((x) => x.severity === 'low').length,
    };
  });

  load(index: number): void {
    this.code.set(this.examples[index]?.code ?? '');
  }
}
