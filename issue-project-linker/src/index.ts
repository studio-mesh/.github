import * as dotenv from "dotenv";
import { GitHubService } from "./services/github.js";
import type { Config, Issue, RepositoryAffiliation } from "./types.js";

// 環境変数の読み込み
dotenv.config();

/**
 * 環境変数を検証し、設定オブジェクトを生成する
 */
const validateAndCreateConfig = (): Config => {
  // ORGANIZATION_NAME の検証
  const organization = process.env.ORGANIZATION_NAME;
  if (!organization) {
    throw new Error("環境変数 ORGANIZATION_NAME が設定されていません");
  }

  // PAT_GITHUB の検証
  const token = process.env.PAT_GITHUB;
  if (!token) {
    throw new Error("環境変数 PAT_GITHUB が設定されていません");
  }

  // PROJECT_NUMBER の検証
  if (!process.env.PROJECT_NUMBER) {
    throw new Error("環境変数 PROJECT_NUMBER が設定されていません");
  }
  const projectNumber = Number(process.env.PROJECT_NUMBER);

  // REPOSITORY_SCOPE の検証
  if (!process.env.REPOSITORY_SCOPE) {
    throw new Error("環境変数 REPOSITORY_SCOPE が設定されていません");
  }
  const affiliation = process.env.REPOSITORY_SCOPE as RepositoryAffiliation;

  return {
    organization,
    token,
    projectNumber,
    affiliation,
  };
};

/**
 * IssueまたはPRをプロジェクトに追加し、結果をログ出力する
 */
const addItemToProject = async (
  githubService: GitHubService,
  item: Issue,
  repoName: string,
  itemType: "issue" | "PR"
) => {
  try {
    await githubService.addIssueToProject(item);
    console.info(`[${repoName}] Added ${itemType} #${item.number} to project`);
  } catch (error) {
    console.error(`[${repoName}] Failed to add ${itemType} #${item.number}:`, error);
  }
};

/**
 * 単一リポジトリのIssueとDependabot PRをプロジェクトに追加する
 */
const addRepositoryItems = async (
  githubService: GitHubService,
  repo: { name: string; owner: string }
) => {
  // オープンIssueの処理
  const issues = await githubService.getOpenIssues(repo.name, repo.owner);
  console.info(`[${repo.name}] Found ${issues.length} open issues`);
  for (const issue of issues) {
    await addItemToProject(githubService, issue, repo.name, "issue");
  }

  // DependabotのPRの処理
  const dependabotPRs = await githubService.getDependabotPullRequests(repo.name, repo.owner);
  console.info(`[${repo.name}] Found ${dependabotPRs.length} Dependabot PRs`);
  for (const pr of dependabotPRs) {
    await addItemToProject(githubService, pr, repo.name, "PR");
  }
};

/**
 * リポジトリのIssueとDependabot PRをプロジェクトにリンクする
 */
const linkRepositoryItemsToProject = async (config: Config) => {
  const githubService = new GitHubService(config);

  // リポジトリを取得(affiliationパラメータで取得スコープを制御)
  const repositories = await githubService.getAuthenticatedUserRepositories();
  console.info(`Found ${repositories.length} repositories`);

  // 各リポジトリの処理
  for (const repo of repositories) {
    await addRepositoryItems(githubService, repo);
  }

  console.info("Successfully completed issue and Dependabot PR linking process");
};

// メイン処理
const main = async () => {
  try {
    // 環境変数の検証と設定の初期化
    const config = validateAndCreateConfig();

    await linkRepositoryItemsToProject(config);
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
};

// プログラムの実行
main();
