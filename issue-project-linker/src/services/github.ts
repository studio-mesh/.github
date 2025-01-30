import { Octokit } from "@octokit/rest";
import type {
  Config,
  Issue,
  OctokitIssue,
  OctokitRepo,
  ProjectResponse,
  Repository,
} from "../types.js";

export class GitHubService {
  private octokit: Octokit;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
    });
  }

  /**
   * リポジトリを取得
   * affiliationパラメータで取得スコープを制御:
   * - owner: 個人リポジトリ
   * - organization_member: 所属組織のリポジトリ
   *
   * アーカイブされたリポジトリは除外
   */
  getAuthenticatedUserRepositories = async (): Promise<Repository[]> => {
    const { data: repos } = await this.octokit.repos.listForAuthenticatedUser({
      visibility: "all", // パブリック・プライベート両方
      affiliation: this.config.affiliation,
      per_page: 100,
    });

    return repos
      .filter((repo: OctokitRepo) => !repo.archived) // アーカイブされたリポジトリを除外
      .map((repo: OctokitRepo) => ({
        name: repo.name,
        owner: repo.owner.login,
      }));
  };

  /**
   * リポジトリ内のオープンIssueを取得
   */
  getOpenIssues = async (
    repo: Repository["name"],
    owner: Repository["owner"]
  ): Promise<Issue[]> => {
    const { data: issues } = await this.octokit.issues.listForRepo({
      owner: owner,
      repo: repo,
      state: "open",
      per_page: 100,
    });

    return issues.map((issue: OctokitIssue) => ({
      nodeId: issue.node_id,
      number: issue.number,
      title: issue.title,
      repository: repo,
    }));
  };

  /**
   * プロジェクトにIssueを追加
   */
  addIssueToProject = async (issue: Issue): Promise<void> => {
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
  };

  /**
   * プロジェクトIDを取得
   * 個人または組織のプロジェクトを取得
   */
  getProjectId = async (): Promise<string> => {
    // 組織のプロジェクトを取得するクエリ
    const orgQuery = `
      query($organization: String!, $number: Int!) {
        organization(login: $organization) {
          projectV2(number: $number) {
            id
          }
        }
      }
    `;

    // 個人のプロジェクトを取得するクエリ
    const userQuery = `
      query($username: String!, $number: Int!) {
        user(login: $username) {
          projectV2(number: $number) {
            id
          }
        }
      }
    `;

    try {
      // まず組織としてプロジェクトの取得を試みる
      const orgResponse: ProjectResponse = await this.octokit.graphql(orgQuery, {
        organization: this.config.organization,
        number: this.config.projectNumber,
      });
      const orgId = orgResponse.organization?.projectV2?.id;
      if (orgId) return orgId;
      throw new Error("Organization project not found");
    } catch (_error) {
      // 組織として取得できない場合は個人プロジェクトとして取得を試みる
      const userResponse: ProjectResponse = await this.octokit.graphql(userQuery, {
        username: this.config.organization,
        number: this.config.projectNumber,
      });
      const userId = userResponse.user?.projectV2?.id;
      if (!userId) {
        throw new Error("Project not found in either organization or user context");
      }
      return userId;
    }
  };
}
