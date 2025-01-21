import * as dotenv from 'dotenv';
import { Config } from './types.js';
import { runWithConfig } from './core.js';

// 環境変数の読み込み
dotenv.config();

// 設定の初期化（個人用）
const config: Config = {
  organization: process.env.GITHUB_USERNAME || '', // 個人用は GITHUB_USERNAME を使用
  projectNumber: Number(process.env.PERSONAL_PROJECT_NUMBER || '1'),
  token: process.env.GITHUB_TOKEN || '',
};

if (!config.organization) {
  throw new Error('GITHUB_USERNAME is required');
}

runWithConfig(config);
