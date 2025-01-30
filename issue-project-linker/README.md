# Issue Project Linker

指定したスコープ（個人、所属組織）のリポジトリのオープンIssueを指定したGitHubプロジェクトに自動的に紐づけるツールです。

## 機能

- 指定したスコープのリポジトリのオープンIssueを取得
- 指定したGitHubプロジェクトにIssueを自動追加
- 重複追加の防止
- GitHub Actionsによる自動実行（毎日）または手動実行

## 必要条件

- Node.js 20.x
- npm
- GitHub Personal Access Token（`repo`と`project`スコープが必要）

## セットアップ

### 1. プロジェクトのセットアップ

1. 依存関係のインストール
   ```bash
   # Biomeの設定用（ルートディレクトリ）
   npm install

   # プロジェクトの依存関係
   cd issue-project-linker
   npm install
   ```

2. 環境変数の設定
   ```bash
   # .env.exampleを.envにコピー
   cp .env.example .env

   # .envファイルを編集し、必要な情報を設定
   ```
   ```env
   GITHUB_TOKEN=your_github_token_here
   ORGANIZATION_NAME=your_owner_name
   PROJECT_NUMBER=your_project_number
   REPOSITORY_SCOPE=owner
   ```

### 2. ビルドと実行

1. TypeScriptのビルド
   ```bash
   npm run build
   ```

2. スクリプトの実行
   ```bash
   npm start
   ```

## GitHub Actionsでの実行

このツールは以下の2つの方法で実行できます：

1. 自動実行
   - 日本時間00:00（UTC 15:00）に自動的に実行されます

2. 手動実行
   - GitHubリポジトリの"Actions"タブから手動で実行できます
   - "Issue Project Linker"ワークフローを選択し、"Run workflow"をクリック

### GitHub Actionsの設定

1. シークレットと変数の設定
   - リポジトリの"Settings" > "Security" > "Secrets and variables" > "Actions"を選択
   - シークレットの設定:
     - `GITHUB_TOKEN`: GitHubのPersonal Access Token(リポジトリ読み取り、プロジェクト書き込み権限が必要)
   - 変数の設定:
     - `ORGANIZATION_NAME`: GitHubのオーナー名(変数として設定)
     - `PROJECT_NUMBER`: GitHubプロジェクトの番号(変数として設定)
     - `REPOSITORY_SCOPE`: リポジトリ取得のスコープ(変数として設定)

## 環境変数

### ローカル実行時の環境変数

| 変数名            | 説明                                                                                           | 必須 |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---- |
| ORGANIZATION_NAME | GitHubのオーナー(個人用:ユーザー名、組織用:組織名)                                             | ✅    |
| GITHUB_TOKEN      | GitHubのPersonal Access Token(リポジトリ読み取り、プロジェクト書き込み権限が必要)              | ✅    |
| PROJECT_NUMBER    | GitHubプロジェクトの番号                                                                       | ✅    |
| REPOSITORY_SCOPE  | リポジトリ取得のスコープ(owner: 個人、organization_member: 所属組織。カンマ区切りで複数指定可) | ✅    |

### GitHub Actions実行時の環境変数

#### シークレットとして設定が必要な変数
セキュリティ上重要な情報のため、シークレットとして設定する必要があります。

| 変数名       | 説明                                                                              | 必須 |
| ------------ | --------------------------------------------------------------------------------- | ---- |
| GITHUB_TOKEN | GitHubのPersonal Access Token(リポジトリ読み取り、プロジェクト書き込み権限が必要) | ✅    |

#### 変数として設定が必要な変数
公開しても問題ない設定値のため、変数として設定します。

| 変数名            | 説明                                                                                           | 必須 |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---- |
| ORGANIZATION_NAME | GitHubのオーナー(個人用:ユーザー名、組織用:組織名)                                             | ✅    |
| PROJECT_NUMBER    | GitHubプロジェクトの番号                                                                       | ✅    |
| REPOSITORY_SCOPE  | リポジトリ取得のスコープ(owner: 個人、organization_member: 所属組織。カンマ区切りで複数指定可) | ✅    |

## 開発

### 開発コマンド

```bash
# ビルド(フォーマット、リント、TypeScriptコンパイル)
npm run build

# 実行
npm start
