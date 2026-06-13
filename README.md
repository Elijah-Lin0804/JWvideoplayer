# JW Bilingual Learning Player

A lightweight, clean, and ad-free web-based video player designed specifically for language learners and technical researchers. Users simply paste the sharing URL of a JW official video, and the script automatically performs intelligent API routing and parsing to deliver an integrated viewing experience featuring **"English audio + synchronized Chinese subtitles"**.

## 🌟 Core Features

- **🚀 Dual-API Routing**: Fully compatible with both legacy and modern official API architectures. Whether handling traditional sharing URLs with a `docid` parameter or newer URLs featuring a `lank` identifier, the background system automatically detects the type and routes the request through the appropriate API channel.
- **🎙️ Anti-403 Forbidden Mechanism**: To bypass the strict permission restrictions of the new `lank` API, this project implements a "legitimate entry via the English gateway" strategy. By directly requesting an authorized, high-definition (720p) English video stream from the server, it completely eliminates 403 Forbidden errors and browser CORS blocking.
- **📝 Dual-Fetch Strategy**: To overcome the architectural constraint where the English API response does not provide Chinese asset data, a dual-track asynchronous fetch technique is utilized. The script retrieves the authorized English video URL from one gateway while simultaneously querying the Chinese gateway to extract the exact hash path for the Traditional Chinese subtitles (`.vtt`), seamlessly merging them in under 0.1 seconds.
- **⚔️ Robust Defensive Engineering**:
  - **Case-Sensitivity Error Prevention**: Adapts seamlessly to inconsistencies in API field casing (such as lowercase `Url` vs. uppercase `URL`), backed by comprehensive null-value checks to ensure application stability.
  - **Deferred Loading Support**: Fully supports the legacy API's deferred loading structure (`__deferred`), automatically dispatching secondary requests to harvest core asset data.
  - **Regex ID Extraction**: Utilizes a powerful Regular Expression engine to precisely strip out valid `docid` numbers, regardless of how malformed or deeply nested the shared URL might be.
- **🎨 Native High-Performance Cinema Experience**: Leverages the native HTML5 `<video>` tag and `<track>` subtitle elements, ensuring exceptional runtime efficiency and supporting customized subtitle styling.

## 🛠️ Tech Stack

- **HTML5**: Native media controls, `crossorigin` cross-origin subtitle mounting, and dynamic `<track>` injection.
- **CSS3**: Flexbox responsive layouts, custom `::cue` subtitle styling, and a modern dark theater theme.
- **JavaScript (ES6+)**: Dual-track asynchronous network requests (`Async/Await`), URL parameter parsing via `URLSearchParams`, Regular Expressions (Regex), and safe object field querying (`.find()`).

## 🚀 Getting Started

1. Download or clone this repository to your local machine.
2. It is highly recommended to launch `index.html` using the VS Code **Live Server** extension (or any local web server) to cleanly bypass local cross-origin restrictions when loading subtitle files.
3. Paste a video sharing URL from the official platform (supports legacy `docid` strings or new URLs containing `?lank=...`).
4. Click the "Load Video" button to begin your immersive language learning session with high-definition English audio and Chinese subtitles.

===

# JW 雙語學習播放器 (JW Bilingual Learning Player)

一個輕量、乾淨且無廣告的網頁影片播放器，專為語言學習者與技術研究者設計。使用者只需貼上 JW 官方影片的分享網址，程式便會全自動進行 API 智慧分流與解析，完美實現**「英文原音發音 + 中文字幕同步」**的整合播放介面。

## 🌟 核心特色

- **🚀 智慧網址分流 (Dual-API Routing)**：完美相容官方新舊兩代 API 體系。不論是帶有 `docid` 的傳統分享網址，還是帶有 `lank` 識別碼的新型網址，後台皆能自動識別並精準切換對應的請求通道。
- **🎙️ 合法繞過防盜鏈 (Anti-403 Forbidden)**：針對新版 `lank` API 的嚴格權限限制，首創「合法敲擊英文大門」策略，直接向官方申請合法的英文高畫質（720p）影片通行證，徹底告別 403 Forbidden 錯誤與瀏覽器 CORS 攔截。
- **📝 雙重大門雙保險 (Dual-Fetch Strategy)**：為了突破新版 API「英文通行證不給中文資料」的防護限制，採用雙軌 Fetch 異步請求技術——左手抓取合法的英文影片網址，右手探路中文大門撈取絕對正確的中文字幕（`.vtt`）雜湊路徑，0.1 秒內流暢合體。
- **⚔️ 強固的防禦機制**：
  - **大小寫魔鬼細節防護**：精準適應官方不同 API 欄位命名不一致的陷阱（如小寫 `Url` 與大寫 `URL`），內建空值防護罩，確保程式永不崩潰。
  - **延遲載入機制支援**：完整支援舊版官方的延遲載入機制（`__deferred`），自動進行二次請求撈取核心資料。
  - **正則數字偵測法**：內建強大的正規表達式（Regex），不論分享網址如何變形，皆能精準剝離出合法的 `docid`。
- **🎨 原生高效劇院體驗**：採用 HTML5 原生 `<video>` 標籤與 `<track>` 字幕軌道載入，效能優異，並支援自定義字幕樣式。

## 🛠️ 技術棧 (Tech Stack)

- **HTML5**：原生影音控制、`crossorigin` 跨網域字幕掛載、動態 `<track>` 軌道注入。
- **CSS3**：Flexbox 響應式版面、自定義 `::cue` 字幕樣式、現代化深色劇院主題。
- **JavaScript (ES6+)**：Async/Await 雙軌異步網路請求、URLSearchParams 參數分析、正規表達式（Regex）、強固的欄位安全篩選器（`.find()`）。

## 🚀 如何使用

1. 將本專案下載或複製（Clone）到本機電腦。
2. 建議使用 VS Code 的 **Live Server** 擴充功能（或任何本機網頁伺服器）啟動 `index.html`（能有效避免原生網頁載入字幕時的本地跨域限制）。
3. 貼上 JW 網站的影片分享連結（支援傳統 `docid` 網址 或 新版包含 `?lank=...` 的網址）。
4. 點擊「載入影片」按鈕，即可開始享受高畫質的英文發音與中文字幕學習環境！