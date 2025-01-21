import * as dotenv from 'dotenv';
import { Config } from './types.js';
import { runWithConfig } from './core.js';

// 環境変数の読み込み
dotenv.config();

// 設定の初期化（組織用）
const config: Config = {
  organization: process.env.ORGANIZATION || 'studio-mesh',
  projectNumber: Number(process.env.PROJECT_NUMBER || '20'),
  token: process.env.GITHUB_TOKEN || '',
};

runWithConfig(config);
