(() => {
  "use strict";
if (window.__WEBVIEW_JS_INJECTOR_LOADED__) { console.log("[MOD] Injector đã chạy → bỏ qua"); return; } window.__WEBVIEW_JS_INJECTOR_LOADED__ = true;
  const GITHUB_USER = "TuanHai03";
  const GITHUB_REPO = "WebViewJSInjector";
  const GITHUB_BRANCH = "main";

  const BASE_URL =
    `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/`;

  const FILES = ["mod-core.js","EpubBuilder.js", "mod-buttons.js"];

  const DB_NAME = "JS";
  const STORE_NAME = "s";

  // =========================================================
  // IndexedDB
  // =========================================================

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);

      req.onupgradeneeded = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function getDB(key) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }

  function saveDB(key, value) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        store.put(value, key);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  }

  // =========================================================
  // Load JS
  // =========================================================

  function runScript(code, name) {
    if (!code) {
      throw new Error(`Không có code: ${name}`);
    }

    // Chạy ở global scope
    (0, eval)(code);

    console.log(`[MOD] Đã load ${name}`);
  }

  // =========================================================
  // Load từ IndexedDB
  // =========================================================

  async function loadFromDB() {

    console.log("[MOD] /index.html -> load từ IndexedDB");

    for (const file of FILES) {

      const code = await getDB(file);

      if (!code) {
        console.error(`[MOD] Không tìm thấy ${file} trong IndexedDB`);
        continue;
      }

      runScript(code, file);
    }

    if (window.MOD && typeof window.MOD.init === "function") {
      window.MOD.init();
    } else {
      console.error("[MOD] window.MOD không tồn tại");
    }
  }

  // =========================================================
  // Fetch GitHub + lưu IndexedDB
  // =========================================================

  async function fetchFromGitHub() {

    console.log("[MOD] /app.v2.php -> fetch GitHub");

    for (const file of FILES) {

      const url = `${BASE_URL}${file}?t=${Date.now()}`;

      const res = await fetch(url, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${url}`);
      }

      const code = await res.text();

      // Lưu code mới vào IndexedDB
      await saveDB(file, code);

      console.log(`[MOD] Đã cập nhật DB: ${file}`);

      // Load ngay code vừa fetch
      runScript(code, file);
    }

    if (window.MOD && typeof window.MOD.init === "function") {
      window.MOD.init();
    } else {
      console.error("[MOD] window.MOD không tồn tại");
    }
  }

  // =========================================================
  // Xác định URL hiện tại
  // =========================================================

  const path = location.pathname;

  console.log("[MOD] Current path:", path);

  // index.html -> DB
  if (path.includes("/index.html")) {

    loadFromDB().catch(error => {
      console.error("[MOD] Lỗi load IndexedDB:", error);
    });

  }

  // app.v2.php -> GitHub
  else if (path.includes("/app.v2.php")) {

    fetchFromGitHub().catch(error => {
      console.error("[MOD] Lỗi fetch GitHub:", error);

      // Nếu fetch lỗi -> dùng bản cache trong DB
      loadFromDB().catch(dbError => {
        console.error("[MOD] Không thể load cache:", dbError);
      });
    });

  }

})();
