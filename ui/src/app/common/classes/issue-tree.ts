import { JiraIssue } from 'src/app/dtos';

export class IssueTree {
  self: JiraIssue;
  children: IssueTree[];
  parent?: IssueTree;
  constructor(issue: JiraIssue, parent?: IssueTree) {
    this.self = issue;
    this.parent = parent;
    this.children = [];
  }

  /**
   * Removes redundant occurances of the given issue from the tree's branches.
   * @param issue The issue to prune from branches
   */
  prune(issue: JiraIssue) {
    let deepestOccurrance = 0;
    let removeCurrentDeepestOccurance: (() => void) | null = null;
    const searchForOccurances = (issueTrees: IssueTree[]) => {
      const possibleDuplicateIssueIndex = issueTrees.findIndex(
        (t) => t.self === issue
      );
      if (possibleDuplicateIssueIndex > -1) {
        const occurance = issueTrees[possibleDuplicateIssueIndex];
        const occuranceDepth = occurance.depth();
        if (occuranceDepth > deepestOccurrance) {
          deepestOccurrance = occuranceDepth;
          if (removeCurrentDeepestOccurance) removeCurrentDeepestOccurance();
          removeCurrentDeepestOccurance = () => {
            issueTrees.splice(possibleDuplicateIssueIndex, 1);
          };
        }
      }

      for (const tree of issueTrees) {
        searchForOccurances(tree.children);
      }
    };

    searchForOccurances(this.children);
  }

  hasChildren() {
    return this.children.length > 0;
  }

  depth() {
    let depth = 0;
    let parent = this.parent;
    while (parent) {
      depth++;
      parent = parent.parent;
    }

    return depth;
  }
}
