import { URLString } from '../common/types';
import { JiraBoardSprint } from './jira-board-sprint';
import { JiraUser } from './jira-user';

export interface JiraIssue {
  maxDependencyDepth: number;
  expand: string;
  id: string;
  self: URLString;
  key: string;
  fields: IssueFields;
}

export interface IssueFields {
  storyPoints: number;
  summary: string;
  issuelinks: {
    id: string;
    self: URLString;
    type: {
      id: string;
      name: 'Blocks' | string;
      inward: 'is blocked by' | string;
      outward: 'blocks' | string;
      self: URLString;
    };
    /**
     * The issue related to the current issue link type.outward
     */
    outwardIssue?: {
      id: string;
      key: string;
      self: URLString;
      fields: {
        summary: string;
        status: {
          self: URLString;
          description: string;
          iconUrl: URLString;
          name: string;
          id: string;
          statusCategory: {
            self: URLString;
            id: string;
            key: string;
            colorName: string;
            name: string;
          };
        };
        priority: {
          self: URLString;
          iconUrl: URLString;
          name: string;
          id: string;
        };
        issuetype: {
          self: URLString;
          id: string;
          description: string;
          iconUrl: URLString;
          name: 'Story' | string;
          subtask: false;
        };
      };
    };
    /**
     * The issue related to the current issue link type.inward
     */
    inwardIssue?: {
      id: string;
      key: string;
      self: URLString;
      fields: {
        summary: string;
        status: {
          self: URLString;
          description: string;
          iconUrl: URLString;
          name: string;
          id: string;
          statusCategory: {
            self: URLString;
            id: string;
            key: string;
            colorName: string;
            name: string;
          };
        };
        priority: {
          self: URLString;
          iconUrl: URLString;
          name: string;
          id: string;
        };
        issuetype: {
          self: URLString;
          id: string;
          description: string;
          iconUrl: URLString;
          name: 'Story' | string;
          subtask: false;
        };
      };
    };
  }[];
  assignee: JiraUser;
  subtasks: [];
  closedSprints: {
    id: string;
    self: URLString;
    state: 'closed' | string;
    name: string;
    startDate: string;
    endDate: string;
    completeDate: string;
    activatedDate: string;
    originBoardId: string;
    goal: string;
  }[];
  issuetype: {
    self: URLString;
    id: string;
    description: string;
    iconUrl: URLString;
    name: 'Story' | string;
    subtask: boolean;
  };
  sprint: JiraBoardSprint;
  status: {
    self: URLString;
    description: string;
    iconUrl: URLString;
    name: string;
    id: string;
    statusCategory: {
      self: URLString;
      id: string;
      key: string;
      colorName: string;
      name: string;
    };
  };
  project: {
    self: URLString;
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    avatarUrls: {
      '48x48': URLString;
      '24x24': URLString;
      '16x16': URLString;
      '32x32': URLString;
    };
  };
  fixVersions: Record<string, unknown>[];
  epic: {
    id: string;
    key: string;
    self: URLString;
    name: string;
    summary: string;
    done: boolean;
  };
  priority: {
    self: URLString;
    iconUrl: URLString;
    name: string;
    id: string;
  };
}
