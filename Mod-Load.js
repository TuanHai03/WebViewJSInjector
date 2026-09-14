(() => {
  "use strict";
  app.debug = {};

  window.onerror = function (msg, url, lineNo, columnNo, error) {
    if (/scrollTo/.test(msg)) {
      return true;
    }

    return true;
  };

  if (window.MOD) {
    console.log("[MOD] Injector đã chạy → bỏ qua");
    return;
  }

  const MOD = {
    GITHUB_USER: "TuanHai03",

    GITHUB_REPO: "WebViewJSInjector",

    GITHUB_BRANCH: "main",

    get BASE_URL() {
      return `https://raw.githubusercontent.com/${this.GITHUB_USER}/${this.GITHUB_REPO}/${this.GITHUB_BRANCH}/`;
    },
    files: [
      "Mod-Style.js",
      "Mod-Core.js",
      "EpubBuilder.js",
      "EpubDowload.js",
      "Mod-Buttons.js",
    ],
    navId: "mod-navbar-item",
    async _loadClickHandler(event) {
      event.preventDefault();
      event.stopPropagation();

      console.log("[MOD BUTTON] Click → loadJS");

      for (const name of MOD.files) {
        await MOD.updateFile(name);
      }
      this.showToast("Đang update file Mod...");
    },
    createbtnMod() {
      const navbar = document.getElementById("mainnavbar");
      // ============================================================
      // KIỂM TRA UI
      // ============================================================
      if (!navbar) {
        console.error("[MOD BUTTON] Không tìm thấy mainnavbar");
        this.Online = null;
        return;
      }
      // ============================================================
      // KHÔNG TẠO TRÙNG
      // ============================================================
      if (document.getElementById("mod-navbar-item")) {
        console.log("[MOD BUTTON] Nút MOD đã tồn tại");

        return;
      }
      const item = document.createElement("tabitem");
      item.id = this.navId;
      const firstItem = navbar.querySelector("tabitem");
      if (firstItem) {
        item.className = firstItem.className;
      } else {
        item.className = "iconbtn waves-effect waves-light";
      }
      item.classList.remove("active");
      // TẠM THỜI: click MOD -> loadJS
      item.addEventListener("click", this._loadClickHandler, true);
      item.innerHTML = `
            <i class="fas fa-tools"></i>
            <text>MOD</text>
        `;

      navbar.appendChild(item);

      this.navItem = item;

      console.log("[MOD BUTTON] Đã tạo nút MOD");
    },
    checkOnline() {
      const path = location.pathname;

      // Mặc định: không xác định
      this.Online = null;

      // index.html -> DB
      if (path.includes("/index.html")) {
        this.Online = false;
      }

      // app.v2.php -> GitHub
      else if (path.includes("/app.v2.php")) {
        this.Online = true;
      }

      console.log("[MOD ONLINE] Online =", this.Online);

      return this.Online;
    },
    checkSQLite() {
      const SQLite =
        window.Capacitor?.Plugins?.CapacitorSQLite ||
        window.Capacitor?.Plugins?.CapacitorSQLitePlugin;

      if (!SQLite) {
        this.showToast("[MOD SQLITE] Không tìm thấy CapacitorSQLite");
        return false;
      }

      this.SQLite = SQLite;

      console.log("[MOD SQLITE] Đã tìm thấy CapacitorSQLite");

      return true;
    },
    async checkTable() {
      try {
        if (!this.SQLite) {
          return false;
        }
        if (this.isTable) {
          return true;
        }
        await this.SQLite.execute({
          database: "app_v2_db",
          statements: `
        CREATE TABLE IF NOT EXISTS mod_scripts (
          name TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `,
          values: [],
        });
        this.isTable = true;
        console.log("[MOD SQLITE] OK");
        return true;
      } catch (e) {
        this.isTable = false;
        console.error("[MOD SQLITE] ERROR:", e);
        return false;
      }
    },
    async readSQL(name) {
      try {
        if (this.isTable != true) {
          if (!(await this.checkTable())) {
            return null;
          }
        }

        name = String(name).replace(/'/g, "''");

        const result = await this.query(
          `SELECT content
       FROM mod_scripts
       WHERE name = '${name}';`,
        );

        if (result.length === 0) {
          return null;
        }

        const encoded =
          result[0].content || (result[1] ? result[1].content : null);

        if (!encoded) {
          return null;
        }

        // Base64 → JS
        return decodeURIComponent(escape(atob(encoded)));
      } catch (e) {
        console.error("[MOD SQLITE] Read error:", name, e);
        return null;
      }
    },
    async writeSQL(name, content) {
      try {
        if (!name || content == null) {
          console.error("[MOD SQLITE] Content không hợp lệ:", name);
          return false;
        }

        if (this.isTable !== true) {
          if (!(await this.checkTable())) {
            return false;
          }
        }
        // JS → Base64
        const encoded = btoa(unescape(encodeURIComponent(String(content))));

        name = String(name).replace(/'/g, "''");

        // UPDATE
        if (
          (await this.noQuery(
            `UPDATE mod_scripts
         SET content = '${encoded}',
             updated_at = CURRENT_TIMESTAMP
         WHERE name = '${name}';`,
          )) == 0
        ) {
          // INSERT
          await this.noQuery(
            `INSERT OR IGNORE INTO mod_scripts
         (name, content)
         VALUES ('${name}', '${encoded}');`,
          );
        }

        this.showToast("[MOD SQLITE] Đã ghi:", name, "Base64:", encoded.length);

        return true;
      } catch (e) {
        console.error("[MOD SQLITE] Write error:", name, e);
        return false;
      }
    },
    query(query) {
      return this.SQLite.query({
        database: "app_v2_db",
        statement: query,
        values: [],
      }).then((result) => result.values);
    },
    noQuery(query) {
      return this.SQLite.execute({
        database: "app_v2_db",
        statements: query,
        values: [],
      }).then((result) => result.changes.changes);
    },
    injectFile(name, content) {
      try {
        eval(content);

        console.log("[MOD] Đã chạy:", name);
        return true;
      } catch (e) {
        console.error("[MOD] Lỗi:", name, e);
        return false;
      }
    },
    async fetchGitHub(name) {
      try {
        // Không online thì không gọi GitHub
        if (this.Online !== true) {
          console.log("[MOD GITHUB] Không Online, bỏ qua:", name);
          return null;
        }
        if (!this.SQLite) {
          console.error("[MOD SQLITE] Không tìm thấy CapacitorSQLite");
          return null;
        }
        const response = await fetch(this.BASE_URL + name + "?t=" + Date.now());

        if (!response.ok) {
          console.error("[MOD GITHUB] Không tải được:", name, response.status);
          return null;
        }

        const content = await response.text();

        console.log("[MOD GITHUB] Đã tải:", name);
        return content;
      } catch (e) {
        console.error("[MOD GITHUB] Lỗi:", name, e);
        return null;
      }
    },
    async loadJS() {
      for (const name of this.files) {
        // ============================================================
        // ĐỌC SQL
        // ============================================================
        let js = await this.readSQL(name);

        // ============================================================
        // SQL CÓ FILE
        // ============================================================
        if (js) {
          console.log("[MOD LOAD] SQL:", name);

          if (this.injectFile(name, js)) {
            continue;
          }

          console.error("[MOD LOAD] SQL lỗi:", name);
        }
        // ============================================================
        // SQL KHÔNG CÓ HOẶC INJECT LỖI
        // → FETCH GITHUB
        // ============================================================
        if ((await this.updateFile(name)) == false) {
          return false;
        }
      }

      console.log("[MOD LOAD] Đã load tất cả file");
      return true;
    },
    async updateFile(name) {
      const js = await this.fetchGitHub(name);

      if (!js) {
        console.error("[MOD LOAD] GitHub lỗi:", name);
        return false;
      }

      // ============================================================
      // INJECT FILE GITHUB
      // ============================================================
      if (!this.injectFile(name, js)) {
        console.error("[MOD LOAD] Inject lỗi:", name);
        return false;
      }
      console.log(
        "[MOD LOAD] Trước writeSQL:",
        name,
        "js null?",
        js === null,
        "js undefined?",
        js === undefined,
        "length:",
        js ? js.length : 0,
      );
      // ============================================================
      // GHI LẠI SQL
      // ============================================================
      if (!(await this.writeSQL(name, js))) {
        console.error("[MOD LOAD] Ghi SQL lỗi:", name);
        return false;
      }
    },
    showToast(message, duration = 2000) {
      let toast = document.getElementById("__mod_toast");

      if (!toast) {
        toast = document.createElement("div");
        toast.id = "__mod_toast";

        Object.assign(toast.style, {
          position: "fixed",
          left: "50%",
          bottom: "80px",
          transform: "translateX(-50%)",
          zIndex: "2147483647",

          padding: "10px 18px",
          borderRadius: "8px",

          background: "rgba(0, 0, 0, 0.85)",
          color: "#fff",

          fontSize: "14px",
          fontFamily: "sans-serif",

          pointerEvents: "none",
          opacity: "0",

          transition: "opacity 0.2s ease",

          maxWidth: "80%",
          textAlign: "center",
        });

        document.body.appendChild(toast);
      }

      toast.textContent = message;

      toast.style.opacity = "1";

      clearTimeout(toast._timer);

      toast._timer = setTimeout(() => {
        toast.style.opacity = "0";
      }, duration);
    },
    async init() {
      this.checkOnline();
      this.createbtnMod();

      if (!this.checkSQLite()) {
        return false;
      }
      return await this.loadJS();
    },
  };
  window.MOD = MOD;
  MOD.init();
})();
