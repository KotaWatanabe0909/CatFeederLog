# CatFeederLog

猫の給餌を家族・同居人と共有管理する Web アプリ。

「誰かがもうあげた？」という二重給餌を防ぐことを最重要ユースケースとする。
餌場に QR コードを貼り、スキャン → 1 タップで給餌記録が完了する設計。

## Features

- **クイック記録** — QR スキャン → ボタン 1 タップで給餌ログを保存
- **リアルタイム共有** — 同一世帯のメンバー全員が即時に記録を確認できる
- **当日の給餌状況** — ホーム画面で本日の記録を時系列表示
- **Google ログイン** — 初回のみ認証、以降はセッション維持（PWA 対応予定）
- **セルフホスト対応** — 誰でも自分の猫用にデプロイして使える

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) プロジェクト（無料枠で動作）

### 1. Clone & Install

```bash
git clone https://github.com/KotaWatanabe0909/CatFeederLog.git
cd CatFeederLog
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして値を入力する。

```bash
cp .env.local.example .env.local
```

| 変数名 | 取得元 |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase ダッシュボード > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 同上（Service Role） |

### 3. 起動

```bash
npm run dev
```

`http://localhost:3000` を開く。

## Self-hosting

個人・家族データはすべて自分の Supabase プロジェクトに保存される。
このリポジトリはコードのみを含み、猫の名前・フード情報・メンバー構成等の個人データは一切含まない。

## License

MIT
