import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GitHubService } from "./github.js";
import { Config, Issue } from "../types.js";

// モックの設定
const mockOctokit = {
  repos: {
    listForOrg: async () => ({
      data: [
        { name: "repo1", node_id: "node1" },
        { name: "repo2", node_id: "node2" },
      ],
    }),
  },
  issues: {
    listForRepo: async () => ({
      data: [
        {
          id: 1,
          node_id: "issue1",
          number: 101,
          title: "Test Issue 1",
        },
      ],
    }),
  },
  graphql: async () => ({
    organization: {
      projectV2: {
        id: "project1",
      },
    },
  }),
};

// Octokitのモック
class MockOctokit {
  constructor() {
    Object.assign(this, mockOctokit);
  }
}

describe("GitHubService", async () => {
  const mockConfig: Config = {
    organization: "test-org",
    projectNumber: 1,
    token: "test-token",
  };

  // @ts-ignore: モックのため
  const service = new GitHubService(mockConfig, MockOctokit);

  await it("リポジトリの一覧を取得できること", async () => {
    const repos = await service.getOrganizationRepositories();
    assert.equal(repos.length, 2);
    assert.deepEqual(repos[0], {
      name: "repo1",
      nodeId: "node1",
    });
  });

  await it("オープンIssueの一覧を取得できること", async () => {
    const issues = await service.getOpenIssues("repo1");
    assert.equal(issues.length, 1);
    assert.deepEqual(issues[0], {
      id: 1,
      nodeId: "issue1",
      number: 101,
      title: "Test Issue 1",
      repository: "repo1",
    });
  });

  await it("プロジェクトIDを取得できること", async () => {
    const projectId = await service.getProjectId();
    assert.equal(projectId, "project1");
  });

  await it("Issueをプロジェクトに追加できること", async () => {
    const mockIssue: Issue = {
      id: 1,
      nodeId: "issue1",
      number: 101,
      title: "Test Issue 1",
      repository: "repo1",
    };

    await assert.doesNotReject(async () => {
      await service.addIssueToProject(mockIssue);
    });
  });
});
