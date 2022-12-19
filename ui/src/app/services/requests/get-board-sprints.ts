import { Pageable } from './pageable';

export interface GetBoardSprints extends Pageable {
  state?: ('active' | 'future' | 'closed')[];
}
