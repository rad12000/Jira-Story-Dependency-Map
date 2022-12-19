import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { StoryComponent } from '../story/story.component';
import * as jsPlumb from '@jsplumb/browser-ui';
import { JiraIssue } from 'src/app/dtos';
import { IssueTree } from 'src/app/common/classes/issue-tree';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  @Input() issues: IssueTree[] = [];
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLDivElement>;
  plumb?: jsPlumb.BrowserJsPlumbInstance;
  idToEl: Record<string, ComponentRef<StoryComponent>> = {};
  cols: HTMLDivElement[] = [];

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.plumb = jsPlumb.newInstance({
      container: this.canvas.nativeElement,
      elementsDraggable: false,
    });

    this.drawRelationships();
    requestAnimationFrame(() => {
      for (const col of this.cols) {
        for (const story of Array.from(
          col.children
        ) as unknown as HTMLElement[]) {
          const blockers = this.plumb?.select({ target: story });
          if (!blockers || blockers.length === 0) continue;
          let offset = 0;
          blockers?.each((b) => {
            const parentEl = b.source as HTMLElement;
            offset += parentEl.offsetTop;
          });
          const avg = offset / blockers.length;
          story.style.position = 'relative';
          story.style.top = `${avg - story.offsetTop}px`;
        }
      }
    });
  }

  private drawRelationships(issues = this.issues) {
    if (!issues) return;
    for (const issue of issues) {
      const issueDepth = issue.self.maxDependencyDepth;
      if (issueDepth > this.cols.length - 1) {
        const col: HTMLDivElement = document.createElement('div');
        col.setAttribute('style', ' display: flex; flex-direction: column;');
        col.classList.add('issue-col');
        this.canvas.nativeElement.append(col);
        this.cols.push(col);
      }

      let existingEl = this.idToEl[issue.self.id];
      if (!existingEl) {
        existingEl = this.createStoryComponent(issue.self);
        this.idToEl[issue.self.id] = existingEl;
        this.cols[issueDepth].append(existingEl.location.nativeElement);
      }

      if (issue.parent) {
        const from = this.idToEl[issue.parent.self.id];
        this.drawLine(from, existingEl);
      }
      if (issue.children?.length > 0) {
        this.drawRelationships(issue.children);
      }
    }
  }

  private drawLine(
    from: ComponentRef<StoryComponent>,
    to: ComponentRef<StoryComponent>
  ) {
    this.plumb?.connect({
      source: from.location.nativeElement,
      target: to.location.nativeElement,
      reattach: true,
      anchors: ['Left', 'Right'],
      overlays: [
        {
          type: 'PlainArrow',
          options: {
            location: 1,
          },
        },
      ],
    });
  }

  private createStoryComponent(issue: JiraIssue) {
    const component = this.viewContainerRef.createComponent(StoryComponent);
    component.instance.issue = issue;
    component.location.nativeElement.style = 'margin: 5px 25px';
    return component;
  }
}
