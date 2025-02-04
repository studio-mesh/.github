import * as dotenv from "dotenv";
import { GitHubService } from "./services/github.js";
import type { Config, RepositoryAffiliation } from "./types.js";

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
 * リポジトリのIssueとDependabotのPRをプロジェクトにリンクする
 */
const linkIssuesToProject = async (config: Config) => {
  const githubService = new GitHubService(config);

  // リポジトリを取得(affiliationパラメータで取得スコープを制御)
  const repositories = await githubService.getAuthenticatedUserRepositories();
  console.info(`Found ${repositories.length} repositories`);

  // 各リポジトリのオープンIssueとDependabotのPRを取得し、プロジェクトに追加
  for (const repo of repositories) {
    // Issueの処理
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

    // Dependabotが作成したPRの処理
    const dependabotPRs = await githubService.getDependabotPullRequests(repo.name, repo.owner);
    console.info(`Found ${dependabotPRs.length} Dependabot PRs in ${repo.name}`);

    for (const pr of dependabotPRs) {
      try {
        await githubService.addIssueToProject(pr);
        console.info(`Added Dependabot PR #${pr.number} from ${repo.name} to project`);
      } catch (error) {
        console.error(`Failed to add Dependabot PR #${pr.number} from ${repo.name}:`, error);
      }
    }
  }

  console.info("Successfully completed issue and Dependabot PR linking process");
};

// メイン処理
const main = async () => {
  try {
    // 環境変数の検証と設定の初期化
    const config = validateAndCreateConfig();

    await linkIssuesToProject(config);
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
};

// プログラムの実行
main();
