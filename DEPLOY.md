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
1. 声ステム → `audio/<song>/vocal/<slug>.m4a`、楽器ステム → `audio/<song>/inst/{full,drums,bass,(brass),other}.m4a`。
2. 完全伴奏と「その他」を生成（ffmpeg・要フルミックスと該当ボーカル）:
   - `full = フルミックス − ボーカル`（位相反転して amix normalize=0）
   - `other = full − drums − bass − brass`
3. すべて `-c:a aac -b:a 160k` で m4a に。全ステムは**サンプル単位で同尺・同タイミング**であること。
4. `index.html` の `SONGS` 配列に1曲追加（`vocalBase/instBase/imgBase` と `parts` を指定）。曲セレクタに自動で並ぶ。

## 曲「オレンジのままで」（2曲目・追加済み）
音源は公式の「メンバー版フルミックス11本＋Off Vocal」から生成。**Demucsのボーカル分離はエッジ（子音・息・アタック）が削れるため不採用**。代わりに：
- **各メンバーの声 = メンバー版 − Off Vocal（位相相殺）**。全トラックが同一マスター由来でサンプルロック（ズレ1sample・ドリフト無）のため、伴奏はイントロ区間で約35dB相殺され、**声の質感は原音無加工のまま**。チャンネル別ゲイン≒1.0。
- **「オケ全部」(full) = 公式 Off Vocal をそのまま**（無加工・最高音質）。末尾3.79sはOff Vocalが短いが、そこは全メンバー無音区間なので問題なし。
- **「パート選択」(drums/bass/other) = フルミックス01のDemucs 4ステム**。この曲は brass なし（`parts` で drums/bass/other のみ定義）。
- 生成スクリプトは会話時のもの。要点：`ffmpeg -ac 2 -f f32le` で読み、numpyで `mem − gain*off` を書き出し `-c:a aac -b:a 160k`。
- **生WAV `audio/オレンジのままで/`（513MB）は音源ソース。デプロイ除外（.vercelignore済）**。git管理も避けるならローカル保管推奨。

## 曲「UNIVERSE!!」（3曲目・9人ソロver）
- 素材＝公式のメンバー**ソロver 9本**（1・2期生のみ：かのん/可可/千砂都/すみれ/恋/きな子/メイ/四季/夏美。3期生マルガレーテ・冬毬は不参加）＋off vocal＋フルミックス。
- 生成はオレンジと同方式（**ソロver − off vocal の位相相殺**）。各ソロverの時間オフセットが個別（-281〜+200サンプル）だったため、`universe_subtract.py`は**±1.5sの粗探索＋微探索**でlagを自動決定。相殺は全員 introCancel ≈ 21dB。`full.m4a`＝off vocal、`drums/bass/other`＝フルミックス01のDemucs 4ステム。
- アプリは**曲ごとに在籍メンバーが変わる**対応：`SONGS[].members` を9人サブセットに。プリセットは在籍者だけに絞って表示・カウント・ハイライト（`effSlugs`/`presetEmpty`）。例：UNIVERSE!!では3期生チップは非表示、KALEIDOSCORE=2人・5yncri5e!=4人。
- `initSong()` で `buildPresets()` を呼び、曲切替時にプリセットを再構築（在籍者数を反映）。
- 生WAV `audio/UNIBERSE!!/`（486MB）はデプロイ除外（.vercelignore済）。カバーは `img/universe_cover.jpg`。

## 便利機能・デザイン
- **オケ（伴奏）のみ再生**：ボーカルを0人にしても再生可能（`play()`の強制ON廃止）。構成タブに「オケのみ」チップ（`GROUPS`の`inst`＝`slugs:[]`）。
- **前回状態の記憶**：曲・選択メンバー・各音量/パン・声↔オケ・全体・オケ設定・ループを `localStorage`（`liella_state`）に保存し、次回起動で自動復元（`saveState`/`applyState`）。
- **配信リンク（Spotify / Apple Music / YouTube Music）＋ジャケ写**：ヒーローを「再生中の曲」カード化。左に各曲のジャケ（`SONGS[].cover`、無い曲はブランドグラデ枠＋♪）、右に曲名＋3サービスのリンクボタン。曲切替で全部連動（`updateServiceLinks`/`svcUrl`）。
  - URL優先度：`SONGS[].spotify/apple/ytm`（実リンク）→ 無ければ各サービスの検索URL（`open.spotify.com/search`、`music.apple.com/jp/search`、`music.youtube.com/search`）。
  - 実リンク：spotify orange=6dadcX0AZur4CcsU2TPqJC / universe=27rVLAVa8XxQwugu3LqQ3H、apple orange=album/1825102105 / universe=album/1765314184。スキップ・カプセルは全サービス検索。
- 「かのんだけに」ボタンは廃止（「全員」「オケのみ」等で代替できるため）。
- **ジャケ写でUIの色が変わる**：カバー画像から鮮やかな代表色を抽出（canvasで24pxに縮小→彩度×明度スコア最大の色）。`--theme`/`--themeSoft` に設定し、ページ背景（上部を淡くティント→白）と「再生中の曲」カードに反映。曲切替で0.5sフェード。ジャケ無し曲はブランド青。実装：`applyCoverTheme`/`setTheme`（同一オリジンなのでcanvasは非汚染）。
- **キャラ周りをコンパクト化**：アイコン ring 78→60px（モバイル64→52）、間隔・ヒーロー高さ（190→152）・立ち絵・ジャケ(66→54)を縮小して初期表示を圧縮。
- **公式サイト風デザイン**：ラブライブ！スーパースター!! 公式の配色を参照。ブランドグラデ `linear-gradient(135deg,#2E47FB→#E40080→#FF0043)`（`--grad`）を再生ボタン/タブ/チップ/曲ピル/天面バーに適用。タイトルは「✦Liella!」をグラデ文字（background-clip:text）に。フォントは Noto Sans JP 優先、白基調。

## スマホ対応・Media Session
- **ロック画面/通知に曲情報**：`navigator.mediaSession` で metadata（曲名／`Liella!（N人重ね）`／カバー画像）・`playbackState`・`setPositionState`・play/pause/stop/seek/prev-next ハンドラを設定。前後トラックは曲セレクタ切替に割当。
- **バックグラウンド再生対応**：出力を `ctx.destination` ではなく `MediaStreamAudioDestinationNode → <audio id="mediaSink">`（`srcObject`）経由にし、OSにメディア再生として認識させる。`play()` 時に `mediaSink.play()`。※iOS SafariはWeb Audioのバックグラウンド制限が強く、ロック時に停止する場合あり（情報表示は出る）。カバーは `img/orange_cover.jpg`（曲に`cover`未設定なら注目メンバーのアイコンで代替）。
- **モバイルUX**：per-memberの音量/パンは**折りたたみ**（`#stripToggle`、既定で閉）。二次コントロール（モード/音量/オケ/定位）は「設定」タブへ集約し初期スクロールを短縮。スライダーは指で掴めるよう高さ拡大。

## コントロールカード（構成 / タイムライン / 設定 タブ）
アイコン群の上のコントロールを**タブ式カード**に集約。`[構成] [タイムライン] [設定]` を切替え、片方だけ表示して省スペース化。設定タブ＝重ね/ソロ・声↔オケ・全体音量・オケ(伴奏)・定位。

### タイムライン（時間でメンバー自動切替・“セットリスト”）
- モード `[オフ] [記録] [自動]`（`tlMode`）。
  - **記録**：再生しながら「構成」タブでプリセット/アイコンをタップ → その瞬間の再生位置に**キュー**として登録（`addCue`）。タップ時刻は読込前に確定するのでズレない。同時刻(±0.4s)は上書き。
  - **自動**：再生中に `tick()→timelineTick()` が現在位置に対応するキューを判定し、切替時のみ `setMembers()` を適用。ループ/シーク時は `tlActiveIdx=-1` で再適用。
- **可視化**：ミニタイムラインバー（`#tlbar`）にキュー区間を色帯＋再生ヘッドで表示（クリックでシーク）。キュー一覧（`#cues`）は時刻・ラベル・人数・✕削除、行クリックでシーク。
- **保存/呼出**：`localStorage` キー `liella_timelines` に名前付きで永続（曲名も保存）。`全消去`あり。
- 実装の要：`setMembers(slugs)` を手動プリセットと自動切替で共用。自動モード開始時に使用メンバーを `preloadTimeline()` で先読みして切替を即時化。

## 重ね方プリセット（期別／ユニット／マイセット）
「構成」タブ内。ワンタップでその集合だけを重ねる。カテゴリ別に3行。
- **期別**（`GROUPS` の cat:"期別"）：全員(11) / 1期生(かのん・可可・千砂都・すみれ・恋) / 2期生(きな子・メイ・四季・夏美) / 3期生(マルガレーテ・冬毬)。
- **ユニット**（cat:"ユニット"）：CatChu!(かのん・すみれ・メイ) / KALEIDOSCORE(可可・恋・マルガレーテ) / 5yncri5e!(千砂都・きな子・四季・夏美・冬毬)。※Sunny PassionはLiella!の11人外なので不採用。
- **マイセット**：ユーザーが今の構成に名前を付けて保存（`localStorage` キー `liella_setlists` に永続）。チップの✕で削除。ブラウザ／ドメイン単位で保存される。
- タップ＝その集合に**総入れ替え**（既存選択をリセット）。以後は個別アイコンで微調整可。現在の選択がいずれかの集合と完全一致する時だけチップがハイライト。
- 再生中に切り替えると、新規メンバーは同期位置で読み込み・開始（読込中はアイコンにスピナー）。`mode` は自動で「重ね」に。
- 期・ユニットを増減したい場合は `GROUPS` に1行追加（`cat` でカテゴリ振り分け）。両曲共通（メンバー同一のため）。

## 重ね時の音量バランス（声↔オケ）
「オレンジのままで」は各メンバーが曲全体をリード歌唱するフルコーラス版のため、単純に重ねると人数ぶん声が大きくなりオケが埋もれる。対策として**声専用バス `vocalBus` を `1/√N`（N＝重ねた人数）で正規化**。
- オケ（backing）は固定レベル → 何人重ねても「声−オケ」比が約−3〜−4dBで一定（原曲フルミックスの比 −4.6dB とほぼ同等）。補正なしだと11人で声がオケ+7dBまで突出していた。
- 1人時は `vocalBus=1.0` で従来と同じ。`声↔オケ` つまみ（`#voice`, 既定1.0／0.3〜1.6）で声とオケの比を手動微調整可。
- 実装：`applyGains()` で `vocalBus.gain = voiceLevel/√N`、`masterGain=userMaster`（ピークはリミッターで保護）。

## 定位（パン）
- 「重ねているメンバー」の各行で **音量** と **左右(パン)** を個別に固定できる（各声のL/Rは自分で決める）。
- **左右に自動配置**：重ねた声を均等に振り分ける初期配置／**中央に戻す**：全員センター。
- ※フルミックス時はパンで伴奏も一緒に動きます。ステム版にすると声だけが動ききれいです。

## 注意
- 音源は著作物です。必ずパスワード保護のまま限定公開で。公開URLを不特定多数に配らないこと。
