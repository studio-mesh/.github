import * as dotenv from "dotenv";
import { GitHubService } from "./services/github.js";
import type { Config, RepositoryAffiliation } from "./types.js";

// 環境変数の読み込み
dotenv.config();

/**
 * Issueの処理を実行
 */
const processIssues = async (config: Config) => {
  if (!config.token) {
    throw new Error("GITHUB_TOKEN is required");
  }

  const githubService = new GitHubService(config);

  // リポジトリを取得（affiliationパラメータで取得スコープを制御）
  const repositories = await githubService.getAuthenticatedUserRepositories();
  console.info(`Found ${repositories.length} repositories`);

  // 各リポジトリのオープンIssueを取得し、プロジェクトに追加
  for (const repo of repositories) {
    const issues = await githubService.getOpenIssues(repo.name, repo.owner);
    console.info(`Found ${issues.length} open issues in ${repo.name}`);

    for (const issue of issues) {
      try {
        await githubService.addIssueToProject(issue);
        console.info(`Added issue #${issue.number} from ${repo.name} to project`);
      } catch (error) {
        console.error(`Failed to add issue #${issue.number} from ${repo.name}:`, error);
      }
    }
  }

  console.info("Successfully completed issue linking process");
};

// メイン処理
const main = async () => {
  try {
    // 設定の初期化
    const config: Config = {
      // GitHubのオーナー（ユーザー名または組織名）
      organization: process.env.GITHUB_OWNER || "",

      // GitHubプロジェクト番号
      projectNumber: Number(process.env.GITHUB_PROJECT_NUMBER || "1"),

      // GitHubトークン
      token: process.env.GITHUB_TOKEN || "",

      // リポジトリ取得のスコープ
      // - owner: 個人リポジトリ（デフォルト）
      // - organization_member: 所属組織のリポジトリ
      affiliation: (process.env.GITHUB_REPO_SCOPE || "owner") as RepositoryAffiliation,
    };

    // 必須パラメータのチェック
    if (!config.organization) {
      throw new Error("GITHUB_OWNER is required");
    }

    if (!config.token) {
      throw new Error("GITHUB_TOKEN is required");
    }

    await processIssues(config);
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
};

// プログラムの実行
main();
