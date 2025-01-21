import type { RestEndpointMethodTypes } from "@octokit/rest";

export type RepositoryAffiliation = 'owner' | 'organization_member' | 'collaborator';

export type OctokitRepo = RestEndpointMethodTypes["repos"]["listForAuthenticatedUser"]["response"]["data"][0];
export type OctokitIssue = RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"][0];

export interface Config {
  token: string;
  organization: string;
  projectNumber: number;
  affiliation?: RepositoryAffiliation;
}

export interface Repository {
  name: string;
  owner: string;
}

export interface Issue {
  nodeId: string;
  number: number;
  title: string;
  repository: string;
}

export interface ProjectResponse {
  user: {
    projectV2: {
      id: string;
    };
  };
}
