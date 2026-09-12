(() => {
  "use strict";

  // =========================================================
  // ============  KHU VỰC CẤU HÌNH NÚT (SỬA Ở ĐÂY)  ==========
  // =========================================================
  //
  // Toàn bộ nút + code xử lý của MOD nằm hết trong khối này.
  // Không cần đụng vào phần code phía dưới.
  //
  // Cấu trúc:
  //
  // BUTTON_GROUPS = [
  //     {
  //         title: "Tên card",
  //         icon:  "fa-xxx",
  //         buttons: [
  //
  //             // BUTTON
  //             {
  //                 id: "id-duy-nhat",
  //                 type: "button",       // có thể bỏ type
  //                 icon: "fa-xxx",
  //                 label: "Chữ trên nút",
  //                 fn: (MOD) => { ... }
  //             },
  //
  //             // CHECKBOX - tự lưu trạng thái
  //             {
  //                 id: "mod-auto-login",
  //                 type: "checkbox",
  //                 icon: "fa-toggle-on",
  //                 label: "Auto Login",
  //                 defaultValue: false,
  //                 fn: (MOD, checked) => { ... }
  //             },
  //
  //             // COMBOBOX / SELECT - tự lưu lựa chọn
  //             {
  //                 id: "mod-quality",
  //                 type: "select",       // hoặc "combobox"
  //                 icon: "fa-list",
  //                 label: "Quality",
  //                 defaultValue: "medium",
  //                 options: [
  //                     { value: "low", label: "Thấp" },
  //                     { value: "medium", label: "Trung bình" },
  //                     { value: "high", label: "Cao" }
  //                 ],
  //                 fn: (MOD, value) => { ... }
  //             }
  //
  //         ]
  //     }
  // ]
  //
  // Checkbox và Select/Combobox được lưu bằng localStorage.
  // Khi mở Web lại, MOD tự khôi phục và gọi fn() với giá trị đã lưu.
  //
  // Có thể dùng:
  // MOD.getSetting("key", defaultValue)
  // MOD.setSetting("key", value)
  // MOD.clearSetting("key")
  // MOD.clearAllSettings()
  //
  // Button cũ không cần sửa.
  //
  // =========================================================

  const BUTTON_GROUPS = [
    {
      title: "Auto",
      icon: "fa-toggle-on",
      buttons: [
        {
          id: "mod-fix-login",
          type: "toggle",
          label: "Fix Login",
          defaultValue: false,

          fn: (MOD, checked) => {
            try {
              const nm = app?.net?.networkManagerXHR;

              if (!nm) {
                MOD.status("Không tìm thấy networkManagerXHR");

                return;
              }

              if (!Array.isArray(nm.defaultDomains)) {
                MOD.status("defaultDomains không phải Array");
                return;
              }

              const domain = "https://sangtacviet.com";

              // =================================================
              // CHECKBOX ON
              // =================================================

              if (checked) {
                const before = nm.defaultDomains.length;

                nm.defaultDomains = nm.defaultDomains.filter(
                  (x) => x !== domain,
                );

                const after = nm.defaultDomains.length;
                MOD.status(`Fix Login ON - đã xóa ${before - after} domain`);

                return;
              }
            } catch (error) {
              MOD.status("Fix-Login lỗi: " + error.message);
            }
          },
        },
        {
          id: "mod-add-dowload",
          type: "toggle",
          label: "Add dowload",
          defaultValue: false,

          fn: (MOD, checked) => {
            // =========================
            // BẬT
            // =========================
            if (checked) {
              // Đã hook rồi thì không hook lại
              if (app.celoader.bookdownloadedrow.__modDownloadHook) {
                console.log("Add Download đã được hook");
                return;
              }

              const oldBookDownloadedRow = app.celoader.bookdownloadedrow;

              const newBookDownloadedRow = function (ele, data) {
                // Gọi hàm gốc
                const row = oldBookDownloadedRow.apply(this, arguments);

                // =========================
                // KIỂM TRA ĐÃ CÓ NÚT CHƯA
                // =========================
                if (row.querySelector(".mod-download-btn")) {
                  return row;
                }

                // =========================
                // TẠO NÚT DOWNLOAD
                // =========================
                const btn = document.createElement("button");

                btn.textContent = "Download";
                btn.className = "mod-download-btn";

                btn.style.cssText = `
                    margin-left: 8px;
                    padding: 5px 10px;
                    border: 0;
                    border-radius: 5px;
                    background: #2196f3;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                `;

                // =========================
                // CLICK DOWNLOAD
                // =========================
                btn.addEventListener("click", function (e) {
                  e.preventDefault();
                  e.stopPropagation();

                  console.log("===== DOWNLOAD =====");
                  console.log("Book:", data);
                  console.log("lid:", data.lid);
                  console.log("id:", data.id);
                  console.log("host:", data.host);
                  console.log("name:", data.name);

                  // CODE DOWNLOAD CỦA BẠN
                });

                // =========================
                // THÊM NÚT
                // =========================
                const tags = row.querySelector(".tags");

                if (tags) {
                  tags.appendChild(btn);
                }

                return row;
              };

              // Đánh dấu hook
              newBookDownloadedRow.__modDownloadHook = true;
              newBookDownloadedRow.__modOriginal = oldBookDownloadedRow;

              app.celoader.bookdownloadedrow = newBookDownloadedRow;

              console.log("Đã bật Add Download");
            }

            // =========================
            // TẮT
            // =========================
            else {
              const current = app.celoader.bookdownloadedrow;

              if (current.__modDownloadHook) {
                app.celoader.bookdownloadedrow = current.__modOriginal;

                document
                  .querySelectorAll(".mod-download-btn")
                  .forEach(function (btn) {
                    btn.remove();
                  });

                console.log("Đã tắt Add Download");
              }
            }
          },
        },
      ],
    },
    {
      title: "Console",
      icon: "fa-terminal",
      buttons: [
        {
          id: "mod-console-clear",
          icon: "fa-trash",
          label: "Clear Console",
          fn: (MOD) => {
            console.clear();
            const el = document.getElementById("mod-status");
            if (el) {
              el.innerHTML = "";
            }
          },
        },
      ],
    },
    {
      title: "JavaScript",
      icon: "fa-code",
      buttons: [
        {
          id: "mod-script-list",
          icon: "fa-file-code",
          label: "Danh sách Script",
          fn: (MOD) => {
            const list = Array.from(document.scripts).map(
              (x) => x.src || "[inline]",
            );

            console.log("[MOD] Scripts:", list);

            MOD.status(`Có ${list.length} script`);
          },
        },
      ],
    },

    {
      title: "WebView",
      icon: "fa-globe",
      buttons: [
        {
          id: "mod-url",
          icon: "fa-link",
          label: "URL hiện tại",
          fn: (MOD) => {
            MOD.status(location.href);
          },
        },
      ],
    },
    // -----------------------------------------------------
    // Ví dụ thêm 1 card + BUTTON / CHECKBOX / COMBOBOX:
    //
    // {
    //     title: "Cấu hình",
    //     icon: "fa-cog",
    //     buttons: [
    //
    //         // Button
    //         {
    //             id: "mod-my-button",
    //             type: "button",
    //             icon: "fa-play",
    //             label: "Chức năng mới",
    //             fn: (MOD) => {
    //                 MOD.status("Đã chạy");
    //             }
    //         },
    //
    //         // Checkbox
    //         {
    //             id: "mod-auto-login",
    //             type: "checkbox",
    //             icon: "fa-sign-in-alt",
    //             label: "Auto Login",
    //             defaultValue: false,
    //             fn: (MOD, checked) => {
    //                 console.log("Auto Login:", checked);
    //             }
    //         },
    //
    //         // Combobox
    //         {
    //             id: "mod-quality",
    //             type: "select",
    //             icon: "fa-sliders-h",
    //             label: "Quality",
    //             defaultValue: "medium",
    //             options: [
    //                 { value: "low", label: "Thấp" },
    //                 { value: "medium", label: "Trung bình" },
    //                 { value: "high", label: "Cao" }
    //             ],
    //             fn: (MOD, value) => {
    //                 console.log("Quality:", value);
    //             }
    //         }
    //     ]
    // }
    //
    // -----------------------------------------------------
  ];

  // Điều kiện app được phép chạy MOD. Sửa ở đây nếu cần đổi.
  const ALLOWED_URL_MATCH = "/app.v2.php";

  // =========================================================
  // ================  HẾT KHU VỰC CẤU HÌNH  ==================
  // =========================================================

  const MOD = {
    tabId: "mod-tab",
    navId: "mod-navbar-item",
    styleId: "mod-style",

    previousTab: 0,

    // =====================================================
    // PERSISTENT SETTINGS
    // =====================================================

    storagePrefix: "MOD_",

    getSetting(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(this.storagePrefix + key);

        if (value === null) {
          return defaultValue;
        }

        if (value === "true") {
          return true;
        }

        if (value === "false") {
          return false;
        }

        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      } catch (error) {
        console.warn("[MOD] Không đọc được localStorage:", error);

        return defaultValue;
      }
    },

    setSetting(key, value) {
      try {
        let saveValue;

        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          saveValue = String(value);
        } else {
          saveValue = JSON.stringify(value);
        }

        localStorage.setItem(this.storagePrefix + key, saveValue);

        console.log(`[MOD] Đã lưu ${key}:`, value);

        return true;
      } catch (error) {
        console.error("[MOD] Không lưu được localStorage:", error);

        return false;
      }
    },

    clearSetting(key) {
      try {
        localStorage.removeItem(this.storagePrefix + key);

        console.log(`[MOD] Đã xóa setting: ${key}`);

        return true;
      } catch (error) {
        console.error("[MOD] Không xóa được setting:", error);

        return false;
      }
    },

    clearAllSettings() {
      try {
        const prefix = this.storagePrefix;
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);

          if (key && key.indexOf(prefix) === 0) {
            keys.push(key);
          }
        }

        keys.forEach((key) => {
          localStorage.removeItem(key);
        });

        console.log(`[MOD] Đã xóa ${keys.length} setting`);

        return true;
      } catch (error) {
        console.error("[MOD] Không xóa được settings:", error);

        return false;
      }
    },

    // =====================================================
    // START
    // =====================================================

    init() {
      // -------------------------------------------------
      // GUARD: chỉ chạy khi URL đúng app mục tiêu
      // -------------------------------------------------
      if (!location.href.includes(ALLOWED_URL_MATCH)) {
        console.log(
          `%c[MOD] Bỏ qua - URL không khớp "${ALLOWED_URL_MATCH}"`,
          "color:#aa0000;font-weight:bold",
        );

        console.log("[MOD] URL hiện tại:", location.href);

        return;
      }

      const mainview = document.getElementById("mainview");

      const maintabdiv = document.getElementById("maintabdiv");

      const navbar = document.getElementById("mainnavbar");

      if (!mainview || !maintabdiv || !navbar) {
        console.error(
          "[MOD] Không tìm thấy mainview / maintabdiv / mainnavbar",
        );

        return;
      }

      // Không tạo trùng

      if (document.getElementById(this.tabId)) {
        console.log("[MOD] Đã tồn tại");
        return;
      }
      this.createStyle();

      this.createTab();

      this.createNavbar(navbar);

      this.bindEvents();

      console.log(
        "%c[MOD] Tab 5 đã được tạo",
        "color:#00aa00;font-weight:bold",
      );
    },

    // =====================================================
    // STYLE
    // =====================================================

    createStyle() {
      const style = document.createElement("style");
      style.id = this.styleId;

      style.textContent = `
            #${this.tabId} {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                overflow: auto;
                position: relative;
                background: var(--mod-bg, #f5f5f5);
                color: var(--mod-text, #222);
            }

            #${this.tabId} .mod-page {
                width: 100%;
                min-height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                background: var(--mod-bg, #f5f5f5);
                color: var(--mod-text, #222);
            }

            #${this.tabId} .mod-header {
                height: 55px;
                min-height: 55px;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                background: #333;
                color: #fff;
            }

            #${this.tabId} .mod-back {
                width: 55px;
                height: 55px;
                min-width: 55px;
                border: 0;
                background: transparent;
                color: #fff;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            #${this.tabId} .mod-back:active {
                background: rgba(255,255,255,.15);
            }

            #${this.tabId} .mod-title {
                flex: 1;
                font-size: 18px;
                font-weight: bold;
                color: #fff !important;
            }

            #${this.tabId} .mod-content {
                flex: 1;
                overflow: auto;
                box-sizing: border-box;
                padding: 15px;
                background: var(--mod-bg, #f5f5f5);
            }

            #${this.tabId} .mod-card {
                background: var(--mod-card-bg, #fff);
                color: var(--mod-text, #222);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 12px;
                box-sizing: border-box;
                box-shadow: 0 2px 5px rgba(0,0,0,.12);
            }

            #${this.tabId} .mod-card-title {
                display: block;
                width: 100%;
                color: var(--mod-title, #222) !important;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            #${this.tabId} .mod-card-title i {
                color: inherit !important;
                margin-right: 6px;
            }

            #${this.tabId} .mod-button {
                display: block;
                width: 100%;
                box-sizing: border-box;
                padding: 12px;
                margin-top: 7px;
                border: 0;
                border-radius: 6px;
                background: var(--mod-button-bg, #eee);
                color: var(--mod-button-text, #222) !important;
                text-align: left;
                font-size: 14px;
                cursor: pointer;
            }

            #${this.tabId} .mod-button i {
                color: inherit !important;
                margin-right: 6px;
            }
            #${this.tabId} .mod-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            #${this.tabId} .mod-toggle-icon {
                width: 20px;
                height: 20px;
                min-width: 20px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 0 !important;
                font-size: 18px;
                flex-shrink: 0;
            }

            #${this.tabId} .mod-toggle-label {
                display: inline-block;
                line-height: 20px;
            }
                        #${this.tabId} .mod-button:active {
                            transform: none;
                        }

                        /* CHECKBOX */

                        #${this.tabId} .mod-checkbox {
                            display: flex;
                            align-items: center;
                            width: 100%;
                            box-sizing: border-box;
                            padding: 12px;
                            margin-top: 7px;
                            border-radius: 6px;
                            background: var(--mod-button-bg, #eee);
                            color: var(--mod-button-text, #222);
                            cursor: pointer;
                            user-select: none;
                        }

                        #${this.tabId} .mod-checkbox input {
                            display: none;
                        }

                        #${this.tabId} .mod-checkmark {
                            width: 20px;
                            height: 20px;
                            min-width: 20px;
                            border: 2px solid #888;
                            border-radius: 4px;
                            margin-right: 10px;
                            box-sizing: border-box;
                            position: relative;
                        }

                        #${this.tabId} .mod-checkbox input:checked + .mod-checkmark {
                            background: #2196f3;
                            border-color: #2196f3;
                        }

                        #${this.tabId} .mod-checkbox input:checked + .mod-checkmark::after {
                            content: "";
                            position: absolute;
                            left: 5px;
                            top: 1px;
                            width: 6px;
                            height: 11px;
                            border: solid white;
                            border-width: 0 2px 2px 0;
                            transform: rotate(45deg);
                        }

                        #${this.tabId} .mod-checkbox-text {
                            font-size: 14px;
                        }

                        #${this.tabId} .mod-checkbox-text i {
                            margin-right: 6px;
                        }


                        /* SELECT / COMBOBOX */

                        #${this.tabId} .mod-select {
                            width: 100%;
                            box-sizing: border-box;
                            margin-top: 7px;
                        }

                        #${this.tabId} .mod-select-label {
                            font-size: 14px;
                            margin-bottom: 5px;
                        }

                        #${this.tabId} .mod-select-label i {
                            margin-right: 6px;
                        }

                        #${this.tabId} .mod-select select {
                            width: 100%;
                            box-sizing: border-box;
                            padding: 10px 12px;
                            border: 0;
                            border-radius: 6px;
                            background: var(--mod-button-bg, #eee);
                            color: var(--mod-button-text, #222);
                            font-size: 14px;
                            outline: none;
                            cursor: pointer;
                        }


                    #${this.tabId} #mod-status {
                max-height: 180px;
                overflow-y: auto;
                padding: 8px;
                margin-top: 8px;
                border-radius: 6px;
                background: #111;
                color: #0f0;
                font-family: monospace;
                font-size: 12px;
                line-height: 1.5;
                white-space: pre-wrap;
                word-break: break-word;
            }

                        /* DARK MODE */
                        @media (prefers-color-scheme: dark) {
                            #${this.tabId} {
                                --mod-bg: #121212;
                                --mod-card-bg: #1e1e1e;
                                --mod-text: #eeeeee;
                                --mod-title: #ffffff;
                                --mod-button-bg: #2a2a2a;
                                --mod-button-text: #eeeeee;
                                --mod-status: #aaaaaa;
                            }

                            #${this.tabId} .mod-card {
                                box-shadow: 0 2px 6px rgba(0,0,0,.4);
                            }
                        }

                        /* Nếu Web dùng class dark */
                        body.dark #${this.tabId},
                        body.dark-mode #${this.tabId},
                        html.dark #${this.tabId},
                        html.dark-mode #${this.tabId} {
                            --mod-bg: #121212;
                            --mod-card-bg: #1e1e1e;
                            --mod-text: #eeeeee;
                            --mod-title: #ffffff;
                            --mod-button-bg: #2a2a2a;
                            --mod-button-text: #eeeeee;
                            --mod-status: #aaaaaa;
                        }
                            /* TOGGLE TRUE / FALSE */

                        #${this.tabId} .mod-toggle {
                display: flex;
                align-items: center;
            }

            #${this.tabId} .mod-toggle .mod-toggle-icon {
                width: 22px;
                min-width: 22px;
                text-align: center;
                margin-right: 8px;
                font-size: 18px;
            }

            #${this.tabId} .mod-toggle .mod-button-label {
                margin: 0;
            }
        `;

      document.head.appendChild(style);
    },

    // =====================================================
    // TẠO HTML CHO 1 CARD (dựa theo BUTTON_GROUPS)
    // =====================================================

    renderGroup(group) {
      const controlsHtml = group.buttons
        .map((btn) => {
          // =====================================================
          // TOGGLE TRUE / FALSE
          // =====================================================
          if (btn.type === "toggle") {
            const saved = MOD.getSetting(btn.id, btn.defaultValue === true);

            return `
                <button
                    class="mod-button mod-toggle"
                    id="${btn.id}"
                >
                    <i class="fas ${
                      saved ? "fa-toggle-on" : "fa-toggle-off"
                    } mod-toggle-icon"></i>

                    <span class="mod-button-label">
                        ${btn.label}
                    </span>
                </button>
            `;
          }

          // =====================================================
          // CHECKBOX CŨ
          // =====================================================
          if (btn.type === "checkbox") {
            const saved = MOD.getSetting(btn.id, btn.defaultValue === true);

            return `
                    <label class="mod-checkbox">

                        <input
                            type="checkbox"
                            id="${btn.id}"
                            ${saved === true ? "checked" : ""}
                        >

                        <span class="mod-checkmark"></span>

                        <span class="mod-checkbox-text">
                            <i class="fas ${btn.icon || "fa-check"}"></i>
                            ${btn.label}
                        </span>

                    </label>
                `;
          }

          // =====================================================
          // SELECT / COMBOBOX
          // =====================================================
          if (btn.type === "select" || btn.type === "combobox") {
            const saved = MOD.getSetting(
              btn.id,
              btn.defaultValue !== undefined
                ? btn.defaultValue
                : btn.options && btn.options.length
                  ? btn.options[0].value
                  : "",
            );

            const optionsHtml = (btn.options || [])
              .map(
                (option) => `
                        <option
                            value="${String(option.value).replace(/"/g, "&quot;")}"
                            ${
                              String(option.value) === String(saved)
                                ? "selected"
                                : ""
                            }
                        >
                            ${option.label}
                        </option>
                    `,
              )
              .join("");

            return `
                    <div class="mod-select">

                        <div class="mod-select-label">
                            <i class="fas ${btn.icon || "fa-list"}"></i>
                            ${btn.label}
                        </div>

                        <select id="${btn.id}">
                            ${optionsHtml}
                        </select>

                    </div>
                `;
          }

          // =====================================================
          // BUTTON THƯỜNG
          // =====================================================
          return `
                <button
                    class="mod-button"
                    id="${btn.id}"
                >
                    <i class="fas ${btn.icon}"></i>
                    ${btn.label}
                </button>
            `;
        })
        .join("");

      return `
        <div class="mod-card">

            <div class="mod-card-title">
                <i class="fas ${group.icon}"></i>
                ${group.title}
            </div>

            ${controlsHtml}

        </div>
        `;
    },

    // =====================================================
    // CREATE MOD TAB
    // =====================================================

    createTab() {
      const tab = document.createElement("div");

      tab.id = this.tabId;

      const groupsHtml = BUTTON_GROUPS.map((group) =>
        this.renderGroup(group),
      ).join("");

      tab.innerHTML = `
            <div class="mod-page">

                <div class="mod-header">
                    <button class="mod-back" id="mod-go-back">
                        <i class="fas fa-arrow-left"></i>
                    </button>

                    <div class="mod-title">
                        <i class="fas fa-tools"></i>
                        MOD
                    </div>
                </div>

                <div class="mod-content">
                    ${groupsHtml}

                    <div class="mod-card">
                        <div class="mod-card-title">
                            <i class="fas fa-info-circle"></i>
                            Status
                        </div>

                        <div class="mod-status" id="mod-status">
                            MOD sẵn sàng
                        </div>
                    </div>
                </div>

            </div>
        `;

      // KHÔNG append vào maintabdiv
      document.body.appendChild(tab);

      this.tab = tab;
    },

    // =====================================================
    // CREATE NAVBAR ITEM
    // =====================================================

    createNavbar(navbar) {
      const item = document.createElement("tabitem");

      item.id = this.navId;

      const firstItem = navbar.querySelector("tabitem");

      if (firstItem) {
        item.className = firstItem.className;
      } else {
        item.className = "iconbtn waves-effect waves-light";
      }

      item.classList.remove("active");

      item.innerHTML = `
            <i class="fas fa-tools"></i>
            <text>MOD</text>
        `;

      navbar.appendChild(item);

      this.navItem = item;
    },

    // =====================================================
    // EVENTS (tự động gắn theo BUTTON_GROUPS)
    // =====================================================

    bindEvents() {
      // CLICK MOD (mở tab)
      this.navItem.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.open();
        },
        true,
      );

      // GO BACK
      document.getElementById("mod-go-back").addEventListener("click", () => {
        this.goBack();
      });

      // Gắn BUTTON / CHECKBOX / SELECT
      BUTTON_GROUPS.forEach((group) => {
        group.buttons.forEach((btn) => {
          const el = document.getElementById(btn.id);

          if (!el) {
            console.warn(`[MOD] Không tìm thấy control #${btn.id}`);
            return;
          }

          if (btn.type === "toggle") {
            let checked = MOD.getSetting(btn.id, btn.defaultValue === true);

            // Icon hiện tại
            const toggleIcon = el.querySelector(".mod-toggle-icon");

            // ==========================================
            // CLICK TOGGLE
            // ==========================================

            el.addEventListener("click", () => {
              checked = !checked;

              // Lưu trạng thái
              MOD.setSetting(btn.id, checked);

              // Lưu vào DOM
              el.dataset.checked = checked ? "true" : "false";

              // ==========================================
              // ĐỔI ICON
              // ==========================================

              if (toggleIcon) {
                toggleIcon.className = checked
                  ? "fas fa-toggle-on mod-toggle-icon"
                  : "fas fa-toggle-off mod-toggle-icon";
              }

              // ==========================================
              // CHẠY FUNCTION
              // ==========================================

              if (typeof btn.fn === "function") {
                btn.fn(MOD, checked);
              }
            });

            // ==========================================
            // CHẠY LẦN ĐẦU
            // ==========================================

            if (typeof btn.fn === "function") {
              btn.fn(MOD, checked);
            }

            return;
          }

          // SELECT / COMBOBOX
          if (btn.type === "select" || btn.type === "combobox") {
            el.addEventListener("change", () => {
              const value = el.value;

              MOD.setSetting(btn.id, value);

              console.log(`[MOD] ${btn.id}:`, value);

              if (typeof btn.fn === "function") {
                btn.fn(MOD, value);
              }
            });

            // Tự chạy với giá trị đã lưu
            if (typeof btn.fn === "function") {
              btn.fn(MOD, el.value);
            }

            return;
          }

          // BUTTON bình thường
          el.addEventListener("click", () => {
            if (typeof btn.fn === "function") {
              btn.fn(MOD);
            }
          });
        });
      });
    },

    // =====================================================
    // OPEN MOD
    // =====================================================

    open() {
      const mainview = document.getElementById("mainview");

      if (mainview && typeof mainview.current === "function") {
        const current = mainview.current();

        if (typeof current === "number") {
          this.previousTab = current;
        }
      }

      this.navItem.classList.add("active");
      this.tab.style.position = "absolute";
      this.tab.style.left = "0";
      this.tab.style.top = "0";
      this.tab.style.width = "100%";
      this.tab.style.height = "100%";
      this.tab.style.zIndex = "9999";
      this.tab.style.display = "block";

      this.status("MOD đang mở");

      console.log("[MOD] Open - previous tab:", this.previousTab);
    },

    // =====================================================
    // GO BACK
    // =====================================================

    goBack() {
      this.tab.style.display = "none";
      this.tab.style.position = "";
      this.tab.style.left = "";
      this.tab.style.top = "";
      this.tab.style.width = "";
      this.tab.style.height = "";
      this.tab.style.zIndex = "";

      this.navItem.classList.remove("active");

      console.log("[MOD] GoBack ->", this.previousTab);
    },

    // =====================================================
    // STATUS
    // =====================================================

    status(text) {
      const el = document.getElementById("mod-status");

      if (!el) {
        return;
      }

      const time = new Date().toLocaleTimeString();

      el.insertAdjacentHTML("beforeend", `<div>[${time}] ${text}</div>`);

      while (el.children.length > 200) {
        el.removeChild(el.firstElementChild);
      }

      el.scrollTop = el.scrollHeight;
    },

    // =====================================================
    // REMOVE
    // =====================================================

    remove() {
      this.tab?.remove();
      this.navItem?.remove();
      document.getElementById(this.styleId)?.remove();
      console.log("[MOD] Removed");
    },
  };
  // Lưu console.log gốc
  const originalConsoleLog = console.log;

  console.log = function (...args) {
    // Vẫn giữ console.log của trình duyệt
    originalConsoleLog.apply(console, args);

    if (window.MOD && typeof MOD.status === "function") {
      const text = args
        .map((x) => {
          if (typeof x === "object" && x !== null) {
            try {
              return JSON.stringify(x);
            } catch {
              return String(x);
            }
          }

          return String(x);
        })
        .join(" ");

      MOD.status(text);
    }
  };
  // =========================================================
  // GLOBAL
  // =========================================================

  window.MOD = MOD;

  MOD.init();
})();
