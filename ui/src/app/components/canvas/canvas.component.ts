import {
  Component,
  ComponentRef,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { StoryComponent } from "../story/story.component";
import * as jsPlumb from "@jsplumb/browser-ui";
import { JiraIssue } from "src/app/dtos";
import { IssueTree } from "src/app/common/classes/issue-tree";

@Component({
  selector: "app-canvas",
  templateUrl: "./canvas.component.html",
  styleUrls: ["./canvas.component.scss"],
})
export class CanvasComponent implements OnInit {
  @Input() issues: IssueTree[] = [];
  @ViewChild("canvas", { static: true }) canvas!: ElementRef<HTMLDivElement>;
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
        const storyEls = Array.from(col.children) as unknown as HTMLElement[];
        storyEls.forEach((story) => {
          const blockers = this.plumb?.select({ target: story });
          if (!blockers || blockers.length === 0) return;
          let offset = 0;
          blockers?.each((b) => {
            const parentEl = b.source as HTMLElement;
            offset += parentEl.offsetTop;
          });
          const avg = offset / blockers.length;
          story.style.position = "relative";
          story.style.top = `${avg - story.offsetTop}px`;
        });

        storyEls.forEach((story, i) => {
          if (i === storyEls.length - 1) return;
          const { overlaps, yOverlap } = elementsOverlap(
            story,
            storyEls[i + 1]
          );
          if (!overlaps) return;
          const numbers = /\d+/g;
          const story2Top = Number(
            storyEls[i + 1].style.top.match(numbers)![0]
          );
          storyEls[i + 1].style.top = `${story2Top + yOverlap}px`;
        });
      }
    });
  }

  private drawRelationships(issues = this.issues) {
    if (!issues) return;
    for (const issue of issues) {
      const issueDepth = issue.self.maxDependencyDepth;
      if (issueDepth > this.cols.length - 1) {
        const issueOffset = issueDepth - this.cols.length;
        for (let i = 0; i <= issueOffset; i++) {
          const col: HTMLDivElement = document.createElement("div");
          col.setAttribute("style", " display: flex; flex-direction: column;");
          col.classList.add("issue-col");
          this.canvas.nativeElement.append(col);
          this.cols.push(col);
        }
      }

      let existingEl = this.idToEl[issue.self.id];
      if (!existingEl) {
        existingEl = this.createStoryComponent(issue.self);
        this.idToEl[issue.self.id] = existingEl;
        try {
          this.cols[issueDepth].append(existingEl.location.nativeElement);
        } catch (e) {
          console.log(this.cols);
          throw e;
        }
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
      anchors: ["Left", "Right"],
      overlays: [
        {
          type: "PlainArrow",
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
    component.location.nativeElement.style = "margin: 5px 25px";
    return component;
  }
}

function elementsOverlap(el1: HTMLElement, el2: HTMLElement) {
  const domRect1 = el1.getBoundingClientRect();
  const domRect2 = el2.getBoundingClientRect();

  return {
    overlaps: !(
      domRect1.top + 5 > domRect2.bottom + 5 ||
      domRect1.right < domRect2.left ||
      domRect1.bottom + 5 < domRect2.top + 5 ||
      domRect1.left > domRect2.right
    ),
    yOverlap: domRect1.bottom + 10 - domRect2.top,
  };
}
