# Liella! ボーカル重ねミキサー — デプロイ手順

## 構成
```
liella-mixer/
  index.html      アプリ本体（相対パス・どこでも動く）
  audio/*.m4a     圧縮音源（AAC 160k・各約4MB）
  img/*.png       立ち絵
  middleware.js   Basic認証ゲート（音源含む全体を保護）
  vercel.json     音源のキャッシュ設定
  start.bat       ローカル起動用（デプロイには含めない）
```

## ローカルで動かす
`start.bat` をダブルクリック → ブラウザで開く（`http://localhost:8137/index.html`）。

## Vercel に限定公開（パスワード保護）
1. Vercel CLI を入れてログイン
   ```bash
   npm i -g vercel
   vercel login
   ```
2. このフォルダで初回デプロイ
   ```bash
   cd C:\aaa\liella-mixer
   vercel
   ```
   - フレームワークは「Other」（静的サイト）でOK。
3. パスワードを環境変数で設定（★これをやらないと誰も入れません）
   ```bash
   vercel env add BASIC_PASS
   ```
   （値に好きなパスワードを入力。ID を変えたい場合は `BASIC_USER` も同様に追加）
4. 本番反映
   ```bash
   vercel --prod
   ```
5. 発行された URL を開くと ID/パスワードを聞かれる。
   ID 未設定時の初期値は `liella`、パスワードは手順3で設定した値。

## 曲を増やすとき
1. 新しい曲の各キャラ版を `audio/` に `<slug>.m4a` で追加（wav なら
   `ffmpeg -i in.wav -c:a aac -b:a 160k out.m4a` で変換）、立ち絵を `img/<slug>.png` に。
2. `index.html` の `SONG.members` に1行追加。
3. 複数曲を切り替えたい場合は曲セレクタ化が必要（別途対応可）。

## 音源構成（現在: STEM_MODE = true）
声だけのステムを重ね、伴奏は別トラックから鳴らす方式。÷N補正が不要で声が埋もれず、パンも濁りません。
```
audio/vocal/<slug>.m4a   … 声だけ11人分（kanon keke chisato sumire ren kinako mei shiki natsumi margarete fuyumari）
audio/inst/full.m4a      … 完全な伴奏（フルミックス − ボーカルで生成）＝「オケ全部」
audio/inst/drums.m4a     … ドラム
audio/inst/bass.m4a      … ベース
audio/inst/brass.m4a     … 管楽器
audio/inst/other.m4a     … その他（full − drums − bass − brass）
audio/*.m4a              … 旧フルミックス（STEM_MODE=false 用フォールバック。デプロイ除外）
```
- 伴奏は「オケ全部」＝full を1本、または「パート選択」＝drums/bass/brass/other を個別にオン/オフ。
- `const STEM_MODE = false;` に戻すと旧フルミックス（audio/<slug>.m4a・÷N補正あり・伴奏パネル非表示）で動く。

### 曲を増やす/別曲のステムを作る手順
1. 声ステム → `audio/vocal/<slug>.m4a`、楽器ステム → `audio/inst/{drums,bass,brass}.m4a`。
2. 完全伴奏と「その他」を生成（ffmpeg・要フルミックスと該当ボーカル）:
   - `full = フルミックス − ボーカル`（位相反転して amix normalize=0）
   - `other = full − drums − bass − brass`
3. すべて `-c:a aac -b:a 160k` で m4a に。全ステムは**サンプル単位で同尺・同タイミング**であること。

## 定位（パン）
- 「重ねているメンバー」の各行で **音量** と **左右(パン)** を個別に固定できる（各声のL/Rは自分で決める）。
- **左右に自動配置**：重ねた声を均等に振り分ける初期配置／**中央に戻す**：全員センター。
- ※フルミックス時はパンで伴奏も一緒に動きます。ステム版にすると声だけが動ききれいです。

## 注意
- 音源は著作物です。必ずパスワード保護のまま限定公開で。公開URLを不特定多数に配らないこと。
