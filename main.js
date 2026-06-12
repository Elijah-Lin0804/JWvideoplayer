document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('loadBtn');
    const player = document.getElementById('mainPlayer');
    const urlInput = document.getElementById('videoUrl'); 

    loadBtn.addEventListener('click', async () => {
        const rawUrl = urlInput.value.trim();

        // ============【第一步：超級強固的 ID 抓取術】============
        let videoId = "";
        let idParamName = "";

        const docidMatch = rawUrl.match(/docid=(\d+)/) || rawUrl.match(/docid-(\d+)/);
        
        if (docidMatch) {
            videoId = docidMatch[1];
            idParamName = "docid";
            console.log(`【網址解析】成功用數字偵測法抓到 docid: ${videoId}`);
        } else {
            const urlParts = rawUrl.split('?');
            if (urlParts.length >= 2) {
                const urlParams = new URLSearchParams(urlParts[1]);
                videoId = urlParams.get('lank');
                idParamName = "lank";
                console.log(`【網址解析】改用傳統法抓到 lank: ${videoId}`);
            }
        }

        if (!videoId) {
            alert("網址裡找不到正確的影片識別碼，請重新複製正確的網址。");
            return;
        }

        // ============【第二步：去官方大門領取第一份說明書】============
        const apiTarget = `https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?${idParamName}=${videoId}&output=json&fileformat=m4v%2Cmp4&alllangs=1&langwritten=CH`;

        try {
            console.log(`正在請求 API: ${apiTarget}`);
            const response = await fetch(apiTarget);
            
            if (!response.ok) {
                throw new Error(`伺服器回報錯誤代碼: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.files || Object.keys(data.files).length === 0) {
                alert("官方說明書裡沒有找到影片檔案資料。");
                return;
            }

            // ============【第三步：處理英文影片】============
            let englishFilesData = data.files['E']; 
            if (!englishFilesData) {
                alert("找不到這部影片的英文版本資料！");
                return;
            }

            if (englishFilesData.__deferred) {
                console.log("發現英文延遲載入紙條，正在前往英文保險箱...");
                const deferredResponse = await fetch(englishFilesData.__deferred);
                const deferredData = await deferredResponse.json();
                englishFilesData = deferredData.files['E'];
            }

            if (!englishFilesData) {
                alert("嘗試打開英文保險箱失敗！");
                return;
            }

            const mp4Files = englishFilesData.MP4 || englishFilesData.mp4 || englishFilesData.M4V || englishFilesData.m4v;
            if (!mp4Files || mp4Files.length === 0) {
                alert("找到了英文抽屜，但裡面沒有可播放的影片格式。");
                return;
            }

            // 優先找 720p 畫質
            const targetVideo = mp4Files.find(f => f.subTitle === '720p') || mp4Files.find(f => f.label === '720p') || mp4Files[0];
            
            // 【數據核心修正】：英文物件的結構也是 file.url，而不是 fileSelect！
            let finalVideoUrl = "";
            if (targetVideo.file && targetVideo.file.url) {
                finalVideoUrl = targetVideo.file.url;
            } else if (targetVideo.fileSelect) {
                finalVideoUrl = targetVideo.fileSelect;
            }
            
            console.log("【精確數據】最終提取出的英文影片網址 finalVideoUrl 是：", finalVideoUrl);


            // ============【第四步：處理中文字幕】============
            let chineseFilesData = data.files['CH'];
            if (!chineseFilesData) {
                alert("找不到這部影片的中文版本資料！");
                return;
            }

            if (chineseFilesData.__deferred) {
                console.log("發現中文延遲載入紙條，正在前往中文保險箱...");
                const deferredCHResponse = await fetch(chineseFilesData.__deferred);
                const deferredCHData = await deferredCHResponse.json();
                chineseFilesData = deferredCHData.files['CH'];
            }

            let finalSubtitleUrl = "";
            const chMp4Files = chineseFilesData.MP4 || chineseFilesData.mp4;
            
            if (chMp4Files && chMp4Files.length > 0) {
                const firstChVideo = chMp4Files[0]; 
                if (firstChVideo.subtitles && firstChVideo.subtitles.url) {
                    finalSubtitleUrl = firstChVideo.subtitles.url;
                }
            }

            if (!finalSubtitleUrl && chineseFilesData.subtitles && chineseFilesData.subtitles.vtt) {
                finalSubtitleUrl = chineseFilesData.subtitles.vtt[0].fileSelect;
            }

            if (!finalSubtitleUrl) {
                alert("找不到這部影片的中文字幕檔！");
                return;
            }

            // ============【第五步：注入播放器】============
            updatePlayer(finalVideoUrl, finalSubtitleUrl);
            
        } catch (error) {
            console.error("發生錯誤：", error);
            alert(`執行過程中發生錯誤：${error.message}`);
        }
    });

    function updatePlayer(videoSrc, subtitleSrc) {
        player.innerHTML = ""; 

        // 注入真實影片網址
        player.src = videoSrc;

        const track = document.createElement('track');
        track.label = "中文";
        track.kind = "subtitles";
        track.srclang = "zh";
        track.src = subtitleSrc;
        track.default = true; 

        player.appendChild(track);
        player.load();
        
        player.play().catch(() => {
            console.log("瀏覽器攔截了自動播放，需要使用者手動點擊播放。");
        });
    }
});