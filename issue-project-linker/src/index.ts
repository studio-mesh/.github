import * as dotenv from "dotenv";
import { GitHubService } from "./services/github.js";
import type { Config, RepositoryAffiliation } from "./types.js";

// 環境変数の読み込み
dotenv.config();

/**
 * リポジトリのIssueをプロジェクトにリンクする
 */
const linkIssuesToProject = async (config: Config) => {
	if (!config.token) {
		throw new Error("PAT_GITHUB is required");
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
				console.info(
					`Added issue #${issue.number} from ${repo.name} to project`,
				);
			} catch (error) {
				console.error(
					`Failed to add issue #${issue.number} from ${repo.name}:`,
					error,
				);
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
			organization: process.env.ORGANIZATION_NAME || "",

			// GitHubプロジェクト番号
			projectNumber: Number(process.env.PROJECT_NUMBER),

			// GitHubトークン
			token: process.env.PAT_GITHUB || "",

			// リポジトリ取得のスコープ
			// - owner: 個人リポジトリ
			// - organization_member: 所属組織のリポジトリ
			affiliation: process.env.REPOSITORY_SCOPE as RepositoryAffiliation,
		};

		// 必須パラメータのチェック
		if (!config.organization) {
			throw new Error("ORGANIZATION_NAME is required");
		}

		if (!config.token) {
			throw new Error("PAT_GITHUB is required");
		}

		if (!process.env.PROJECT_NUMBER) {
			throw new Error("PROJECT_NUMBER is required");
		}

		if (!process.env.REPOSITORY_SCOPE) {
			throw new Error("REPOSITORY_SCOPE is required");
		}

		await linkIssuesToProject(config);
	} catch (error) {
		console.error("Error occurred:", error);
		process.exit(1);
	}
};

// プログラムの実行
main();
