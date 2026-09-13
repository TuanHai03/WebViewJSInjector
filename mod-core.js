(() => {
  "use strict";

  // =========================================================
  // MOD CORE - Phần lõi, KHÔNG chứa danh sách nút.
  // Danh sách nút (BUTTON_GROUPS) được nạp riêng từ mod-buttons.js
  // và gán vào MOD.BUTTON_GROUPS trước khi gọi MOD.renderGroup
  // =========================================================

  const MOD = window.MOD;
  MOD.tabId = "mod-tab";
  MOD.styleId = "mod-style";

  MOD.previousTab = 0;
  // Sẽ được mod-buttons.js gán đè trước khi renderGroup chạy
  MOD.BUTTON_GROUPS = [];

  // =====================================================
  // PERSISTENT SETTINGS
  // =====================================================

  MOD.storagePrefix = "MOD_";

  MOD.getSetting = function (key, defaultValue = null) {
    try {
      const value = localStorage.getItem(MOD.storagePrefix + key);

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
  };

  MOD.setSetting = function (key, value) {
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

      localStorage.setItem(MOD.storagePrefix + key, saveValue);

      console.log(`[MOD] Đã lưu ${key}:`, value);

      return true;
    } catch (error) {
      console.error("[MOD] Không lưu được localStorage:", error);

      return false;
    }
  };

  MOD.clearSetting = function (key) {
    try {
      localStorage.removeItem(MOD.storagePrefix + key);

      console.log(`[MOD] Đã xóa setting: ${key}`);

      return true;
    } catch (error) {
      console.error("[MOD] Không xóa được setting:", error);

      return false;
    }
  };

  MOD.clearAllSettings = function () {
    try {
      const prefix = MOD.storagePrefix;
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
  };

  // =====================================================
  // STYLE
  // =====================================================

  MOD.createStyle = function () {
    const style = document.createElement("style");
    style.id = MOD.styleId;

    style.textContent = `
            #${MOD.tabId} {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                overflow: auto;
                position: relative;
                background: var(--mod-bg, #f5f5f5);
                color: var(--mod-text, #222);
            }

            #${MOD.tabId} .mod-page {
                width: 100%;
                min-height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                background: var(--mod-bg, #f5f5f5);
                color: var(--mod-text, #222);
            }

            #${MOD.tabId} .mod-header {
                height: 55px;
                min-height: 55px;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                background: #333;
                color: #fff;
            }

            #${MOD.tabId} .mod-back {
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

            #${MOD.tabId} .mod-back:active {
                background: rgba(255,255,255,.15);
            }

            #${MOD.tabId} .mod-title {
                flex: 1;
                font-size: 18px;
                font-weight: bold;
                color: #fff !important;
            }

            #${MOD.tabId} .mod-content {
                flex: 1;
                overflow: auto;
                box-sizing: border-box;
                padding: 15px;
                background: var(--mod-bg, #f5f5f5);
            }

            #${MOD.tabId} .mod-card {
                background: var(--mod-card-bg, #fff);
                color: var(--mod-text, #222);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 12px;
                box-sizing: border-box;
                box-shadow: 0 2px 5px rgba(0,0,0,.12);
            }

            #${MOD.tabId} .mod-card-title {
                display: block;
                width: 100%;
                color: var(--mod-title, #222) !important;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            #${MOD.tabId} .mod-card-title i {
                color: inherit !important;
                margin-right: 6px;
            }

            #${MOD.tabId} .mod-button {
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

            #${MOD.tabId} .mod-button i {
                color: inherit !important;
                margin-right: 6px;
            }
            #${MOD.tabId} .mod-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            #${MOD.tabId} .mod-toggle-icon {
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

            #${MOD.tabId} .mod-toggle-label {
                display: inline-block;
                line-height: 20px;
            }
                        #${MOD.tabId} .mod-button:active {
                            transform: none;
                        }

                        /* CHECKBOX */

                        #${MOD.tabId} .mod-checkbox {
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

                        #${MOD.tabId} .mod-checkbox input {
                            display: none;
                        }

                        #${MOD.tabId} .mod-checkmark {
                            width: 20px;
                            height: 20px;
                            min-width: 20px;
                            border: 2px solid #888;
                            border-radius: 4px;
                            margin-right: 10px;
                            box-sizing: border-box;
                            position: relative;
                        }

                        #${MOD.tabId} .mod-checkbox input:checked + .mod-checkmark {
                            background: #2196f3;
                            border-color: #2196f3;
                        }

                        #${MOD.tabId} .mod-checkbox input:checked + .mod-checkmark::after {
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

                        #${MOD.tabId} .mod-checkbox-text {
                            font-size: 14px;
                        }

                        #${MOD.tabId} .mod-checkbox-text i {
                            margin-right: 6px;
                        }


                        /* SELECT / COMBOBOX */

                        #${MOD.tabId} .mod-select {
                            width: 100%;
                            box-sizing: border-box;
                            margin-top: 7px;
                        }

                        #${MOD.tabId} .mod-select-label {
                            font-size: 14px;
                            margin-bottom: 5px;
                        }

                        #${MOD.tabId} .mod-select-label i {
                            margin-right: 6px;
                        }

                        #${MOD.tabId} .mod-select select {
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


                    #${MOD.tabId} #mod-status {
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
                            #${MOD.tabId} {
                                --mod-bg: #121212;
                                --mod-card-bg: #1e1e1e;
                                --mod-text: #eeeeee;
                                --mod-title: #ffffff;
                                --mod-button-bg: #2a2a2a;
                                --mod-button-text: #eeeeee;
                                --mod-status: #aaaaaa;
                            }

                            #${MOD.tabId} .mod-card {
                                box-shadow: 0 2px 6px rgba(0,0,0,.4);
                            }
                        }

                        /* Nếu Web dùng class dark */
                        body.dark #${MOD.tabId},
                        body.dark-mode #${MOD.tabId},
                        html.dark #${MOD.tabId},
                        html.dark-mode #${MOD.tabId} {
                            --mod-bg: #121212;
                            --mod-card-bg: #1e1e1e;
                            --mod-text: #eeeeee;
                            --mod-title: #ffffff;
                            --mod-button-bg: #2a2a2a;
                            --mod-button-text: #eeeeee;
                            --mod-status: #aaaaaa;
                        }
                            /* TOGGLE TRUE / FALSE */

                        #${MOD.tabId} .mod-toggle {
                display: flex;
                align-items: center;
            }

            #${MOD.tabId} .mod-toggle .mod-toggle-icon {
                width: 22px;
                min-width: 22px;
                text-align: center;
                margin-right: 8px;
                font-size: 18px;
            }

            #${MOD.tabId} .mod-toggle .mod-button-label {
                margin: 0;
            }
                #${MOD.tabId} .mod-card-title.mod-collapse {
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                  width: 100% !important;
                  box-sizing: border-box;
                  cursor: pointer;
              }

              #${MOD.tabId} .mod-card-title.mod-collapse > span {
                  display: flex;
                  align-items: center;
                  flex: 1;
              }

              #${MOD.tabId} .mod-card-title.mod-collapse > .mod-collapse-icon {
                  display: block !important;
                  margin-left: auto !important;
                  margin-right: 0 !important;
                  flex-shrink: 0;
                  font-size: 14px;
              }
        `;

    document.head.appendChild(style);
  };

  // =====================================================
  // CREATE MOD TAB
  // =====================================================

  MOD.createTab = function () {
    // Nếu TAB đã tồn tại thì dùng lại
    const oldTab = document.getElementById(MOD.tabId);

    if (oldTab) {
      MOD.tab = oldTab;
      console.log("[MOD] TAB đã tồn tại");
      return;
    }

    // Tạo STYLE trước nếu chưa có
    if (!document.querySelector("#" + MOD.styleId)) {
      MOD.createStyle();
    }

    // Tạo TAB
    const tab = document.createElement("div");
    tab.id = MOD.tabId;
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

    MOD.tab = tab;
    MOD.navItem.removeEventListener("click", MOD._loadClickHandler, true);

    MOD.navItem.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        MOD.open();
      },
      true,
    );

    // GO BACK
    document.getElementById("mod-go-back").addEventListener("click", () => {
      MOD.goBack();
    });
  };
  // =====================================================
  // TẠO HTML CHO 1 CARD (dựa theo MOD.BUTTON_GROUPS)
  // =====================================================

  MOD.renderGroup = function () {
    if (!Array.isArray(MOD.BUTTON_GROUPS) || MOD.BUTTON_GROUPS.length === 0) {
      console.warn(
        "[MOD] BUTTON_GROUPS rỗng - hãy nạp mod-buttons.js trước khi gọi",
      );
      return;
    }

    // =====================================================
    // TÌM TAB
    // =====================================================
    const tab = MOD.tab || document.getElementById(MOD.tabId);

    if (!tab) {
      console.error("[MOD] Không tìm thấy TAB để render");
      return;
    }

    // =====================================================
    // TÌM VÙNG CONTENT
    // =====================================================
    const content = tab.querySelector(".mod-content");

    if (!content) {
      console.error("[MOD] Không tìm thấy .mod-content");
      return;
    }

    // =====================================================
    // XÓA TOÀN BỘ NỘI DUNG CŨ
    // =====================================================
    content.innerHTML = "";
    try {
      // =====================================================
      // RENDER TỪNG GROUP
      // =====================================================
      MOD.BUTTON_GROUPS.forEach((group) => {
        if (!group || !Array.isArray(group.buttons)) {
          return;
        }

        const controlsHtml = group.buttons
          .map((btn) => {
            // =================================================
            // TOGGLE
            // =================================================
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

            // =================================================
            // CHECKBOX
            // =================================================
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

            // =================================================
            // SELECT / COMBOBOX
            // =================================================
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

            // =================================================
            // BUTTON THƯỜNG
            // =================================================
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

        // =====================================================
        // TẠO CARD
        // =====================================================
        const card = document.createElement("div");

        card.className = "mod-card";

        card.innerHTML = `
                          <div class="mod-card-title mod-collapse">
                              <span>
                                  <i class="fas ${group.icon || "fa-tools"}"></i>
                                  ${group.title || ""}
                              </span>

                              <i class="fas fa-chevron-down mod-collapse-icon"></i>
                          </div>

                          <div class="mod-card-content" style="display:none;">
                              ${controlsHtml}
                          </div>
                      `;

        content.appendChild(card);
      });
      const modstatus = document.createElement("div");

      modstatus.className = "mod-card";

      modstatus.innerHTML = `
    <div class="mod-card-title">
        <i class="fas fa-info-circle"></i>
        Status
    </div>

    <div class="mod-status" id="mod-status">
        MOD sẵn sàng
    </div>
`;

      content.appendChild(modstatus);
      content.querySelectorAll(".mod-collapse").forEach((title) => {
        title.addEventListener("click", function () {
          const card = this.closest(".mod-card");
          const body = card.querySelector(".mod-card-content");
          const icon = this.querySelector(".mod-collapse-icon");

          if (!body) return;

          const hidden = body.style.display === "none";

          body.style.display = hidden ? "" : "none";

          icon.classList.toggle("fa-chevron-down", hidden);
          icon.classList.toggle("fa-chevron-up", !hidden);
        });
      });
    } catch (error) {
      console.error(
        "[MOD] Lỗi render nút chức năng:",
        error && error.message ? error.message : error,
      );

      console.error("[MOD] Stack:", error && error.stack);
    }
    // =====================================================
    // BIND EVENT SAU KHI RENDER
    // =====================================================
    MOD.bindEvents();

    console.log("[MOD] Đã render lại toàn bộ BUTTON_GROUPS");
  };

  // =====================================================
  // EVENTS (tự động gắn theo MOD.BUTTON_GROUPS)
  // =====================================================

  MOD.bindEvents = function () {
    // Gắn BUTTON / CHECKBOX / SELECT
    MOD.BUTTON_GROUPS.forEach((group) => {
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
  };

  // =====================================================
  // OPEN MOD
  // =====================================================

  MOD.open = function () {
    const mainview = document.getElementById("mainview");

    if (!mainview) {
      console.error("[MOD.open] Không tìm thấy mainview");
      return;
    }
    if (mainview && typeof mainview.current === "function") {
      const current = mainview.current();

      if (typeof current === "number") {
        MOD.previousTab = current;
      }
    }

    MOD.navItem.classList.add("active");
    MOD.tab.style.position = "absolute";
    MOD.tab.style.left = "0";
    MOD.tab.style.top = "0";
    MOD.tab.style.width = "100%";
    MOD.tab.style.height = "100%";
    MOD.tab.style.zIndex = "9999";
    MOD.tab.style.display = "block";

    MOD.status("MOD đang mở");

    console.log("[MOD] Open - previous tab:", MOD.previousTab);
  };

  // =====================================================
  // GO BACK
  // =====================================================

  MOD.goBack = function () {
    MOD.tab.style.display = "none";
    MOD.tab.style.position = "";
    MOD.tab.style.left = "";
    MOD.tab.style.top = "";
    MOD.tab.style.width = "";
    MOD.tab.style.height = "";
    MOD.tab.style.zIndex = "";

    MOD.navItem.classList.remove("active");

    console.log("[MOD] GoBack ->", MOD.previousTab);
  };

  // =====================================================
  // STATUS
  // =====================================================

  MOD.status = function (text) {
    const el = document.getElementById("mod-status");

    if (!el) {
      console.error("Không có mod-status");
      return;
    }

    const time = new Date().toLocaleTimeString();

    el.insertAdjacentHTML("beforeend", `<div>[${time}] ${text}</div>`);

    while (el.children.length > 200) {
      el.removeChild(el.firstElementChild);
    }

    el.scrollTop = el.scrollHeight;
  };

  // =====================================================
  // REMOVE (xóa tab / navbar / style)
  // =====================================================

  MOD.remove = function () {
    MOD.tab?.remove();
    MOD.navItem?.remove();
    document.getElementById(MOD.styleId)?.remove();
    console.log("[MOD] Removed");
  };

  // =====================================================
  // Ghi đè console.log để in vào Status,
  // đồng thời expose bản gốc để nút "Hủy Mod" khôi phục lại.
  // =====================================================

  const originalConsoleLog = console.log;
  MOD._originalConsoleLog = originalConsoleLog;

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
  MOD.createTab();
})();
