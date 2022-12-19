import { IssueFields, JiraIssue } from 'src/app/dtos';
import { IssueTree } from './issue-tree';

fdescribe('IssueTree', () => {
  it('should assign self correctly', () => {
    // Arrange
    const issue: JiraIssue = {
      maxDependencyDepth: 0,
      expand: '',
      id: '',
      self: '',
      key: '',
      fields: null as unknown as IssueFields,
    };

    // Act
    const issueTree = new IssueTree(issue);

    // Assert
    expect(issueTree.self).toBe(issue);
    expect(issueTree.parent).toBeUndefined();
  });

  it('should assign parent correctly', () => {
    // Arrange
    const issue: JiraIssue = {
      maxDependencyDepth: 0,
      expand: '',
      id: '',
      self: '',
      key: '',
      fields: null as unknown as IssueFields,
    };

    // Act
    const issueTreeParent = new IssueTree(issue);
    const issueTree = new IssueTree(issue, issueTreeParent);

    // Assert
    expect(issueTree.self).toBe(issue);
    expect(issueTreeParent.self).toBe(issue);
    expect(issueTree.parent).toBe(issueTreeParent);
    expect(issueTreeParent.parent).toBeUndefined();
  });
});
