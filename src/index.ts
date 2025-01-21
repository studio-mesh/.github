import * as dotenv from 'dotenv';
import { GitHubService } from './services/github.js';
import { Config } from './types.js';

// 環境変数の読み込み
dotenv.config();

async function run() {
  try {
    // 設定の初期化
    const config: Config = {
      organization: process.env.ORGANIZATION || 'studio-mesh',
      projectNumber: Number(process.env.PROJECT_NUMBER || '20'),
      token: process.env.GITHUB_TOKEN || '',
    };

    if (!config.token) {
      throw new Error('GITHUB_TOKEN is required');
    }

    const githubService = new GitHubService(config);

    // 組織内の全リポジトリを取得
    const repositories = await githubService.getOrganizationRepositories();
    console.log(`Found ${repositories.length} repositories`);

    // 各リポジトリのオープンIssueを取得し、プロジェクトに追加
    for (const repo of repositories) {
      const issues = await githubService.getOpenIssues(repo.name);
      console.log(`Found ${issues.length} open issues in ${repo.name}`);

      for (const issue of issues) {
        try {
          await githubService.addIssueToProject(issue);
          console.log(`Added issue #${issue.number} from ${repo.name} to project`);
        } catch (error) {
          console.error(`Failed to add issue #${issue.number} from ${repo.name}:`, error);
        }
      }
    }

    console.log('Successfully completed issue linking process');
  } catch (error) {
    console.error('Error occurred:', error);
    process.exit(1);
  }
}

run();
