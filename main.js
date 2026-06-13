document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('loadBtn');
    const player = document.getElementById('mainPlayer');
    const urlInput = document.getElementById('videoUrl'); 

    // 主任務流程：按鈕點擊後，像是總經理一樣下達清晰的步驟指令
    loadBtn.addEventListener('click', async () => {
        const rawUrl = urlInput.value.trim();

        // 1. 解析網址
        const { videoId, apiType } = parseVideoId(rawUrl);
        if (!videoId) {
            alert("網址裡找不到正確的影片識別碼，請重新複製正確的網址。");
            return;
        }

        try {
            // 2. 獲取核心資料（向採購部門要乾淨的成品）
            const { videoUrl, subtitleUrl } = await fetchMediaData(apiType, videoId);

            // 安全防護檢查
            if (!videoUrl) {
                alert("未能成功獲取有效的影片網址。");
                return;
            }
            if (!subtitleUrl && apiType === "docid") {
                alert("找不到這部影片的中文字幕檔！");
                return;
            }

            // 3. 注入播放器
            updatePlayer(videoUrl, subtitleUrl);
            
        } catch (error) {
            console.error("發生錯誤：", error);
            alert(`執行過程中發生錯誤：${error.message}`);
        }
    });

    /**
     * 【第一步：網址解析功能】
     * 專職從各種複雜網址中提取 videoId 與 路線標記
     */
    function parseVideoId(rawUrl) {
        let videoId = "";
        let apiType = ""; 

        const docidMatch = rawUrl.match(/docid=(\d+)/) || rawUrl.match(/docid-(\d+)/);
        
        if (docidMatch) {
            videoId = docidMatch[1];
            apiType = "docid"; 
            console.log(`【網址解析】成功用數字偵測法抓到 docid: ${videoId}`);
        } else {
            const urlParts = rawUrl.split('?');
            if (urlParts.length >= 2) {
                const urlParams = new URLSearchParams(urlParts[1]);
                videoId = urlParams.get('lank');
                if (videoId) {
                    apiType = "lank"; 
                    console.log(`【網址解析】改用傳統法抓到 lank: ${videoId}`);
                }
            }
        }
        return { videoId, apiType };
    }

    /**
     * 【第二、三、四步：資料採購核心】
     * 專職處理複雜的官方 API 請求，最終只回傳最乾淨的影片與字幕網址
     */
    async function fetchMediaData(apiType, videoId) {
        let videoUrl = "";
        let subtitleUrl = "";

        // 根據路線決定主要 API 請求目標
        const apiTarget = apiType === "docid"
            ? `https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?docid=${videoId}&output=json&fileformat=m4v%2Cmp4&alllangs=1&langwritten=CH`
            : `https://b.jw-cdn.org/apis/mediator/v1/media-items/E/${videoId}?clientType=www`; // 合法英文大門

        console.log(`正在請求主要 API (${apiType} 模式): ${apiTarget}`);
        const response = await fetch(apiTarget);
        if (!response.ok) throw new Error(`主要伺服器回報錯誤代碼: ${response.status}`);
        const data = await response.json();

        // ─── 路線 A：新型 LANK 雙重大門處理 ───
        if (apiType === "lank") {
            if (!data.media || data.media.length === 0 || !data.media[0].files) {
                throw new Error("新版官方說明書裡沒有找到影片檔案。");
            }

            // 1. 提取英文影片網址
            const lankFiles = data.media[0].files;
            const targetLankVideo = lankFiles.find(f => f.progressiveDownloadURL && f.progressiveDownloadURL.includes('720P')) 
                                 || lankFiles.find(f => f.progressiveDownloadURL);
            if (targetLankVideo) {
                videoUrl = targetLankVideo.progressiveDownloadURL;
                console.log("【LANK 影片成功】合法英文影片網址：", videoUrl);
            }

            // 2. 加開分身敲中文大門獲取精確中文字幕
            try {
                const chineseApiTarget = `https://b.jw-cdn.org/apis/mediator/v1/media-items/CH/${videoId}?clientType=www`;
                console.log(`正在加開分身請求中文 API 獲取字幕: ${chineseApiTarget}`);
                
                const chResponse = await fetch(chineseApiTarget);
                if (chResponse.ok) {
                    const chData = await chResponse.json();
                    if (chData.media && chData.media[0] && chData.media[0].files) {
                        const chFiles = chData.media[0].files;
                        const targetChVideo = chFiles.find(f => f.subtitles && f.subtitles.url) || chFiles[0];
                        if (targetChVideo && targetChVideo.subtitles && targetChVideo.subtitles.url) {
                            subtitleUrl = targetChVideo.subtitles.url;
                            console.log("【LANK 字幕成功】精準獲取中文字幕網址：", subtitleUrl);
                        }
                    }
                }
            } catch (chError) {
                console.error("嘗試獲取中文字幕時發生錯誤，改為無字幕播放：", chError);
            }
        } 
        // ─── 路線 B：原本舊有的 DOCID 處理 ───
        else {
            if (!data.files || Object.keys(data.files).length === 0) {
                throw new Error("官方說明書裡沒有找到影片檔案資料。");
            }

            // 處理英文影片 (docid 專用)
            let englishFilesData = data.files['E']; 
            if (!englishFilesData) throw new Error("找不到這部影片的英文版本資料！");

            if (englishFilesData.__deferred) {
                const deferredResponse = await fetch(englishFilesData.__deferred);
                const deferredData = await deferredResponse.json();
                englishFilesData = deferredData.files['E'];
            }

            const mp4Files = englishFilesData.MP4 || englishFilesData.mp4 || englishFilesData.M4V || englishFilesData.m4v;
            const targetVideo = mp4Files.find(f => f.subTitle === '720p') || mp4Files.find(f => f.label === '720p') || mp4Files[0];
            videoUrl = (targetVideo.file && targetVideo.file.url) ? targetVideo.file.url : targetVideo.fileSelect;

            // 處理中文字幕 (docid 專用)
            let chineseFilesData = data.files['CH'];
            if (chineseFilesData && chineseFilesData.__deferred) {
                const deferredCHResponse = await fetch(chineseFilesData.__deferred);
                const deferredCHData = await deferredCHResponse.json();
                chineseFilesData = deferredCHData.files['CH'];
            }

            if (chineseFilesData) {
                const chMp4Files = chineseFilesData.MP4 || chineseFilesData.mp4;
                if (chMp4Files && chMp4Files.length > 0 && chMp4Files[0].subtitles) {
                    subtitleUrl = chMp4Files[0].subtitles.url;
                }
                if (!subtitleUrl && chineseFilesData.subtitles && chineseFilesData.subtitles.vtt) {
                    subtitleUrl = chineseFilesData.subtitles.vtt[0].fileSelect;
                }
            }
        }

        // 清掉臨時留空的 Console 提示，統一打包回傳
        return { videoUrl, subtitleUrl };
    }

    /**
     * 【第五步：注入播放器功能】
     * 專職將網址渲染到 HTML5 畫面上
     */
    function updatePlayer(videoSrc, subtitleSrc) {
        player.innerHTML = ""; 
        player.src = videoSrc;

        if (subtitleSrc) {
            const track = document.createElement('track');
            track.label = "中文";
            track.kind = "subtitles";
            track.srclang = "zh";
            track.src = subtitleSrc;
            track.default = true; 
            player.appendChild(track);
        }

        player.load();
        player.play().catch(() => {
            console.log("瀏覽器攔截了自動播放，需要使用者手動點擊播放。");
        });
    }
});