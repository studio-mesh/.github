# .github

## 管理しているファイル

- issue テンプレート
  - [issue の種類は開発手順で定義している](https://www.notion.so/smesh/93974d4113254d34a828bff8890dcf74?pvs=4)
- Pull Request テンプレート

# Issue Project Linker

組織内の全リポジトリのオープンIssueを指定したGitHubプロジェクトに自動的に紐づけるツールです。

## 機能

- 組織内の全リポジトリのオープンIssueを取得
- 指定したGitHubプロジェクトにIssueを自動追加
- 重複追加の防止
- GitHub Actionsによる自動実行（毎日）または手動実行

## セットアップ

### 必要条件

- Node.js 20.x
- npm
- GitHub Personal Access Token（`repo`と`project`スコープが必要）

### インストール

```bash
# 依存関係のインストール
npm install
```

### 環境変数の設定

1. `.env.example`を`.env`にコピー
```bash
cp .env.example .env
```

2. `.env`ファイルを編集し、必要な情報を設定
```env
GITHUB_TOKEN=your_github_token_here
ORGANIZATION=your_organization_name
PROJECT_NUMBER=your_project_number
```

## 使用方法

### ローカルでの実行

#### 組織用

1. TypeScriptのビルド
```bash
npm run build
```

2. スクリプトの実行
```bash
npm start
```

#### 個人用

1. TypeScriptのビルド
```bash
npm run build
```

2. スクリプトの実行
```bash
npm run start:personal
```

### GitHub Actionsでの実行

このツールは以下の2つの方法で実行できます：

1. 自動実行
   - 毎日00:00（UTC）に自動的に実行されます

2. 手動実行
   - GitHubリポジトリの"Actions"タブから手動で実行できます
   - "Issue Project Linker"ワークフローを選択し、"Run workflow"をクリック

## 環境変数

| 変数名 | 説明 | 必須 | デフォルト値 |
|--------|------|------|--------------|
| GITHUB_TOKEN | GitHubのPersonal Access Token | ✅ | - |
| ORGANIZATION | GitHubの組織名（組織用） | - | studio-mesh |
| PROJECT_NUMBER | GitHubプロジェクトの番号（組織用） | - | 20 |
| GITHUB_USERNAME | GitHubのユーザー名（個人用） | - | - |
| PERSONAL_PROJECT_NUMBER | GitHubプロジェクトの番号（個人用） | - | 1 |

## 開発

### テストの実行

```bash
npm test
```

### リントの実行

```bash
npm run lint
```

### コードのフォーマット

```bash
npm run format
