export interface Config {
  token: string;
  organization: string;
  projectNumber: number;
  affiliation?: string;  // リポジトリ取得のスコープ（owner, organization_member, collaborator）
}

export interface Repository {
  name: string;
  nodeId: string;
  owner: string;
}

export interface Issue {
  id: number;
  nodeId: string;
  number: number;
  title: string;
  repository: string;
}
