import { JiraBoard } from 'src/app/dtos';
import { Pageable } from './pageable';

export type GetBoards = Pageable<JiraBoard>;
