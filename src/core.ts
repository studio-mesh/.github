import { GitHubService } from './services/github.js';
import { Config } from './types.js';

export async function processIssues(config: Config) {
  if (!config.token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const githubService = new GitHubService(config);

  // リポジトリを取得
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
}

export async function runWithConfig(config: Config) {
  try {
    await processIssues(config);
  } catch (error) {
    console.error('Error occurred:', error);
    process.exit(1);
  }
}
