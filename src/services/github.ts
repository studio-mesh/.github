import { Octokit } from "@octokit/rest";
import { Config, Issue, Repository } from "../types.js";

export class GitHubService {
  private octokit: Octokit;
  private config: Config;

  constructor(config: Config, OctokitClass: typeof Octokit = Octokit) {
    this.config = config;
    this.octokit = new OctokitClass({
      auth: config.token,
    });
  }

  /**
   * リポジトリを取得（組織または個人）
   */
  async getOrganizationRepositories(): Promise<Repository[]> {
    const { data: repos } = await this.octokit.repos.listForUser({
      username: this.config.organization,
      type: "all",
      per_page: 100,
    });

    return repos.map((repo: { name: string; node_id: string }) => ({
      name: repo.name,
      nodeId: repo.node_id,
    }));
  }

  /**
   * リポジトリ内のオープンIssueを取得
   */
  async getOpenIssues(repo: Repository['name']): Promise<Issue[]> {
    const { data: issues } = await this.octokit.issues.listForRepo({
      owner: this.config.organization,
      repo: repo,
      state: "open",
      per_page: 100,
    });

    return issues.map((issue: { id: number; node_id: string; number: number; title: string }) => ({
      id: issue.id,
      nodeId: issue.node_id,
      number: issue.number,
      title: issue.title,
      repository: repo,
    }));
  }

  /**
   * プロジェクトにIssueを追加
   */
  async addIssueToProject(issue: Issue): Promise<void> {
    // GraphQL APIを使用してプロジェクトにIssueを追加
    const query = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
          }
        }
      }
    `;

    try {
      await this.octokit.graphql(query, {
        projectId: await this.getProjectId(),
        contentId: issue.nodeId,
      });
    } catch (error) {
      if (error instanceof Error) {
        // すでに追加済みの場合はスキップ
        if (error.message.includes("DUPLICATE_ITEM")) {
          return;
        }
      }
      throw error;
    }
  }

  /**
   * プロジェクトIDを取得
   */
  async getProjectId(): Promise<string> {
    const query = `
      query($username: String!, $number: Int!) {
        user(login: $username) {
          projectV2(number: $number) {
            id
          }
        }
      }
    `;

    interface ProjectResponse {
      user: {
        projectV2: {
          id: string;
        };
      };
    }

    const response: ProjectResponse = await this.octokit.graphql(query, {
      username: this.config.organization,
      number: this.config.projectNumber,
    });

    return response.user.projectV2.id;
  }
}
