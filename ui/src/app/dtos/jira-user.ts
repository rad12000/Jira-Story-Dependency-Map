import { URLString } from '../common/types';

export interface JiraUser {
  self: URLString;
  name: string;
  key: string;
  emailAddress: string;
  avatarUrls: {
    '48x48': URLString;
    '24x24': URLString;
    '16x16': URLString;
    '32x32': URLString;
  };
  displayName: string;
  active: boolean;
  timeZone: string;
}
