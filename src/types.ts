export interface Config {
  token: string;
  organization: string;
  projectNumber: number;
}

export interface Repository {
  name: string;
  nodeId: string;
}

export interface Issue {
  id: number;
  nodeId: string;
  number: number;
  title: string;
  repository: string;
}
