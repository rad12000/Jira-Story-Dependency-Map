import { Pageable } from './pageable';

export interface GetBoards extends Pageable {
  type?: ('kanban' | 'scrum')[];
  projectKeyOrId?: string;
  name?: string;
}
