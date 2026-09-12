(() => {
  "use strict";

  // =========================================================
  // MOD LOADER
  // Dán file này vào console để nạp toàn bộ MOD từ GitHub.
  //
  // SỬA 3 DÒNG DƯỚI ĐÂY cho đúng repo của bạn:
  // =========================================================

  const GITHUB_USER = "TuanHai03"; // <-- đổi thành username của bạn
  const GITHUB_REPO = "WebViewJSInjector"; // <-- đổi thành tên repo
  const GITHUB_BRANCH = "main"; // <-- hoặc tên branch/tag bạn dùng

  // raw.githubusercontent.com gần như không cache -> hợp khi đang code/test.
  // Nếu muốn dùng CDN jsDelivr (nhanh hơn nhưng cache mạnh hơn), đổi BASE_URL
  // thành: `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/`
  const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/`;

  // Thứ tự BẮT BUỘC: core trước, buttons sau
  // (buttons.js cần window.MOD đã tồn tại để gán BUTTON_GROUPS vào)
  const FILES = ["mod-core.js", "mod-buttons.js"];

  // =========================================================
  // KHÔNG CẦN SỬA GÌ PHÍA DƯỚI
  // =========================================================

  async function loadRaw(url) {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} khi tải ${url}`);
    }

    const code = await res.text();

    // eval trong scope global để các IIFE bên trong có thể
    // gán vào window.MOD như bình thường.
    (0, eval)(code);
  }

  (async () => {
    try {
      for (const file of FILES) {
        // thêm ?t=timestamp để né cache trình duyệt/CDN khi đang test
        const url = `${BASE_URL}${file}?t=${Date.now()}`;

        await loadRaw(url);

        console.log(`[MOD] Đã nạp ${file}`);
      }

      if (window.MOD && typeof window.MOD.init === "function") {
        window.MOD.init();
      } else {
        console.error("[MOD] window.MOD không tồn tại sau khi nạp file");
      }
    } catch (error) {
      console.error("[MOD] Lỗi khi nạp MOD:", error);
    }
  })();
})();
