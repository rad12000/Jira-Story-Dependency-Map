import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { JiraBoard, JiraBoardSprint, JiraIssue } from '../dtos';
import * as req from './requests';
import * as res from './responses';

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  private static BASE_URL = `${window.location.origin}/api`;
  private listBoardsURI(): URL {
    return new URL(`${JiraService.BASE_URL}/rest/agile/latest/board`);
  }
  private listBoardSprintsURI(boardId: string): URL {
    return new URL(
      `${JiraService.BASE_URL}/rest/agile/latest/board/${boardId}/sprint`
    );
  }
  private listSprintIssuesURI(sprintId: string): URL {
    const uri = new URL(
      `${JiraService.BASE_URL}/rest/agile/latest/sprint/${sprintId}/issue`
    );
    uri.searchParams.append(
      'fields',
      'issuetype,sprint,assignee,subtasks,closedSprints,status,epic,priority,fixVersions,issuelinks,summary,customfield_10007'
    );
    return uri;
  }

  constructor(private readonly client: HttpClient) {}

  getBoards(opts?: req.GetBoards) {
    const uri = this.listBoardsURI();
    if (opts) {
      for (const [key, val] of Object.entries(opts)) {
        if (key === 'type') continue;
        uri.searchParams.append(key, val);
      }

      if (Array.isArray(opts.type)) {
        uri.searchParams.append('type', opts.type.join(','));
      }
    }

    return this.client.get<res.GetBoards>(uri.toString());
  }

  getBoardSprints(board: JiraBoard, opts?: req.GetBoardSprints) {
    const uri = this.listBoardSprintsURI(board.id);
    if (opts) {
      for (const [key, val] of Object.entries(opts)) {
        if (key === 'state') continue;
        uri.searchParams.append(key, val);
      }

      if (Array.isArray(opts.state)) {
        uri.searchParams.append('state', opts.state.join(','));
      }
    }

    return this.client.get<res.GetBoardSprints>(uri.toString()).pipe(
      map((r) => {
        if (r.isLast) {
          return r;
        }

        const o = opts ?? {};
        o.startAt = (r.startAt ?? 0) + r.values.length;
        r.next = () => this.getBoardSprints(board, o);
        return r;
      })
    );
  }

  getSprintIssues(sprint: JiraBoardSprint, opts?: req.GetSprintIssues) {
    const uri = this.listSprintIssuesURI(sprint.id);
    if (opts) {
      for (const [key, val] of Object.entries(opts)) {
        uri.searchParams.append(key, val);
      }
    }

    return this.client.get<res.GetIssues>(uri.toString()).pipe(
      map((r) => {
        if (r.isLast) {
          return r;
        }

        const o = opts ?? {};
        o.startAt =
          (r.startAt ?? 0) +
          (r as unknown as { issues: JiraIssue[] }).issues.length;
        r.next = () => this.getSprintIssues(sprint, o);
        r.values = (r as unknown as { issues: JiraIssue[] }).issues;
        r.values = r.values.map((v) => {
          v.maxDependencyDepth = 0;
          v.fields.storyPoints = (
            v.fields as unknown as { customfield_10007: number }
          ).customfield_10007;
          return v;
        });
        r = JSON.parse(
          JSON.stringify(r).replaceAll(
            'https://jira.control4.com',
            JiraService.BASE_URL
          )
        );
        return r;
      })
    );
  }
}
