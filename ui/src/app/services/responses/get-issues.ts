import { JiraIssue } from 'src/app/dtos';
import { Pageable } from './pageable';

export type GetIssues = Pageable<JiraIssue>;
