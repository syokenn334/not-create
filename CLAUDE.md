# プロジェクト固有ルール

## Git / GitHub の identity(重要)

このプロジェクトは**個人の GitHub アカウント**で管理する。会社の identity は使わない。

- コミット author: **`syokenn334` / `yannyaya@icloud.com`**
  - リポジトリローカルに設定済み(`git config user.name/user.email`)。
  - 会社メール `（社内メールは記載しない）` は**このリポジトリでは使わない**。
- push 先: 個人アカウント **`syokenn334`** の GitHub。
- **commit / push の前に gh アカウントを切り替える**:
  ```bash
  gh auth switch --user syokenn334   # 事前に gh auth login --user syokenn334 が必要
  ```
- コミットメッセージ末尾の Co-Authored-By トレーラ(Claude)はそのまま付ける。

## ホスティング

- ギャラリーサイトは **GitHub Pages + GitHub Actions**(push → 自動ビルド → 公開)。
- `@strudel/web` / `@strudel/draw` は **AGPL-3.0**。公開リポジトリ(ソース公開)なので義務は満たされる。
