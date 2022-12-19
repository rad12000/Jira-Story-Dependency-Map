import { Component, OnInit } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { IssueTree } from 'src/app/common/classes/issue-tree';
import { JiraBoard, JiraBoardSprint, JiraIssue } from 'src/app/dtos';
import { JiraService } from 'src/app/services/jira.service';
import * as resp from 'src/app/services/responses';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  focusBoard?: JiraBoard;
  focusSprint?: JiraBoardSprint;
  focusSprintStatus: 'closed' | 'active' | 'future' = 'active';

  boardResults$?: Observable<resp.GetBoards>;
  sprints?: resp.GetBoardSprints;
  filteredSprints?: resp.GetBoardSprints;
  sprintResults$?: Observable<resp.GetBoardSprints>;
  issues$?: Observable<IssueTree[]>;

  constructor(
    private readonly jiraService: JiraService,
    private readonly storageService: StorageService
  ) {}

  ngOnInit(): void {
    const fBoard = this.storageService.focusBoard;
    if (!fBoard) {
      this.storageService.focusSprintStatus = 'active';
      this.storageService.focusSprint = null;
    }

    this.focusSprintStatus = this.storageService.focusSprintStatus;
    this.focusSprint = this.storageService.focusSprint ?? undefined;
    if (this.focusSprint) {
      if (this.focusSprint.originBoardId != fBoard?.id) {
        this.focusSprint = undefined;
        this.storageService.focusSprint = null;
      } else {
        this.setFocusSprint(this.focusSprint);
      }
    }
    if (fBoard) {
      this.setFocusBoard(fBoard);
    }
  }

  searchBoards(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.boardResults$ = this.jiraService.getBoards({
      name: val,
      maxResults: 5,
    });
  }

  setFocusBoard(b: JiraBoard) {
    this.focusBoard = b;
    this.loadSprints({ value: this.focusSprintStatus });
    this.storageService.focusBoard = b;
  }

  setFocusSprint(s: JiraBoardSprint) {
    this.focusSprint = s;
    this.storageService.focusSprint = s;
    this.issues$ = this.jiraService.getSprintIssues(s).pipe(
      map((issues) => {
        return this.createRelationships(issues.values);
      })
    );
  }

  createRelationships(issues: JiraIssue[]) {
    const startingPoints = issues.reduce((prev, iss) => {
      if (iss.fields.issuelinks.length === 0) {
        prev.push(iss);
        return prev;
      }

      let blocks = false;
      let blocked = false;
      for (const link of iss.fields.issuelinks) {
        if (
          link.outwardIssue &&
          issues.findIndex((i) => i.id === link.outwardIssue?.id) > -1
        ) {
          blocks = true;
        }
        if (
          link.inwardIssue &&
          issues.findIndex((i) => i.id === link.inwardIssue?.id) > -1
        ) {
          blocked = true;
        }
      }

      if ((blocks || !blocks) && !blocked) {
        prev.push(iss);
      }

      return prev;
    }, [] as JiraIssue[]);

    return startingPoints.map((b) =>
      this.createBlocksRelationships(issues, b, 1)
    );
  }

  private createBlocksRelationships(
    issues: JiraIssue[],
    issue: JiraIssue,
    depth: number,
    result = new IssueTree(issue)
  ) {
    if (issue.fields.issuelinks.length === 0) return result;

    for (const link of issue.fields.issuelinks) {
      if (!link.outwardIssue || link.type.id != '10000') continue;
      const outwardIssue = issues.find((i) => i.id === link.outwardIssue?.id);
      if (!outwardIssue) continue;
      outwardIssue.maxDependencyDepth =
        depth > outwardIssue.maxDependencyDepth
          ? depth
          : outwardIssue.maxDependencyDepth;
      const newResult = new IssueTree(outwardIssue, result);
      result.children.push(newResult);
      let root = newResult;
      while (root) {
        if (!root.parent) {
          break;
        } else {
          root = root.parent;
        }
      }
      root.prune(outwardIssue);
      this.createBlocksRelationships(issues, outwardIssue, ++depth, newResult);
    }

    return result;
  }

  loadSprints({ value: status }: { value: 'closed' | 'active' | 'future' }) {
    this.storageService.focusSprintStatus = status;
    this.sprintResults$ = this.jiraService
      .getBoardSprints(this.focusBoard!, {
        state: [status],
        maxResults: 5,
      })
      .pipe(
        tap((s) => {
          this.sprints = s;
          this.filteredSprints = { ...s };
        })
      );
  }

  searchSprints(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.filterSprints(val);
  }

  private filterSprints(val: string) {
    if (!this.sprints) return;
    const filtered = this.sprints.values.filter((v) =>
      v.name.toLowerCase().includes(val.toLowerCase())
    );
    this.filteredSprints!.values = filtered;
    if (filtered.length >= 5) return;
    if (!this.sprints.next) return;

    this.sprintResults$ = this.sprints.next().pipe(
      tap((r) => {
        r.values = [...(this.sprints?.values ?? []), ...r.values];
        this.sprints = r;
        this.filterSprints(val);
      })
    );
  }
}
