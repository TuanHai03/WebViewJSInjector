(() => {
  "use strict";

  // =========================================================
  // ============  KHU VỰC CẤU HÌNH NÚT (SỬA Ở ĐÂY)  ==========
  // =========================================================
  //
  // File này CHỈ chứa danh sách nút + code xử lý.
  // Toàn bộ phần "máy móc" (tạo tab, style, sự kiện...) nằm ở
  // mod-core.js, không cần đụng vào.
  //
  // File này PHẢI được nạp SAU mod-core.js (vì cần MOD
  // đã tồn tại để gán BUTTON_GROUPS vào).
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
  // =========================================================

  if (!window.MOD.tab) {
    console.error(
      "[MOD] mod-core.js chưa được nạp - hãy nạp mod-core.js trước mod-buttons.js",
    );
    return;
  }
  const MOD = window.MOD;
  const updateGroup = {
    title: "Cập nhật",
    icon: "fa-cloud-download-alt",
    buttons: [],
  };
  updateGroup.buttons.push({
    id: "mod-update-load",
    type: "button",
    icon: "fa-sync-alt",
    label: "Update Mod Load",

    fn: async (MOD) => {
      try {
        const load = await MOD.fetchGitHub("Mod-Load.js");

        if (!load) {
          MOD.showToast("Không tải được Mod Load");
          return;
        }

        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("JS", 1);

          request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains("s")) {
              db.createObjectStore("s");
            }
          };

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });

        await new Promise((resolve, reject) => {
          const tx = db.transaction("s", "readwrite");
          const store = tx.objectStore("s");

          store.put(load, "injector");

          tx.oncomplete = () => {
            resolve();
          };

          tx.onerror = () => {
            reject(tx.error);
          };
        });

        db.close();

        console.log("[MOD] Đã lưu Mod-Load.js vào IndexedDB");

        MOD.showToast("Đã lưu Mod Load");
      } catch (error) {
        console.error("[MOD] Lỗi lưu Mod Load:", error);
        MOD.showToast("Lỗi lưu Mod Load");
      }
    },
  });
  // =========================================================
  // TỰ ADD BUTTON TỪ MOD.files
  // =========================================================
  for (let i = 0; i < MOD.files.length; i++) {
    const name = MOD.files[i];

    updateGroup.buttons.push({
      id: "mod-update-" + i,

      type: "button",

      icon: "fa-file-code",

      label: "Update " + name,

      fn: async (MOD) => {
        await MOD.updateFile(name);
      },
    });
  } // =========================================================
  // UPDATE ALL
  // =========================================================
  updateGroup.buttons.push({
    id: "mod-update-all",
    type: "button",
    icon: "fa-sync-alt",
    label: "Update All",

    fn: async (MOD) => {
      for (const name of MOD.files) {
        await MOD.updateFile(name);
      }
      console.log("[MOD LOAD] Đã load tất cả file");
      return true;
    },
  });
  updateGroup.buttons.push({
    id: "mod-reload",
    type: "button",
    icon: "fa-sync-alt",
    label: "Load lại trang",

    fn: (MOD) => {
      location.reload();
    },
  });
  MOD.BUTTON_GROUPS = [
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
          id: "mod-dowload-raw",
          type: "toggle",
          label: "Download Raw",
          defaultValue: false,

          fn: (MOD, checked) => {
            MOD.isRaw = checked;
          },
        },
        {
          id: "mod-add-dowload",
          type: "toggle",
          label: "Add dowload",
          defaultValue: false,

          fn: (MOD, checked) => {
            // =====================================================
            // TẮT
            // =====================================================
            if (!checked) {
              // Khôi phục hàm gốc
              if (window.__MOD_OLD_BOOKDOWNLOADEDROW__) {
                app.celoader.bookdownloadedrow =
                  window.__MOD_OLD_BOOKDOWNLOADEDROW__;

                delete window.__MOD_OLD_BOOKDOWNLOADEDROW__;

                console.log("[MOD] Đã bỏ hook bookdownloadedrow");
              }

              // Xóa các nút đã thêm
              document
                .querySelectorAll(".mod-download-btn")
                .forEach(function (btn) {
                  btn.remove();
                });

              return;
            }

            // =====================================================
            // HÀM THÊM NÚT DOWNLOAD
            // =====================================================
            function addDownloadButton(row, data) {
              if (!row) return;

              // Đã có nút thì không thêm nữa
              if (row.querySelector(".mod-download-btn")) {
                return;
              }

              const btn = document.createElement("button");

              btn.innerHTML = `
                    <svg
                        class="mod-epub-icon"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    ><path
                            d="M6 2.5H19L26 9.5V29.5H6Z"
                            fill="white"
                            stroke="currentColor"
                            stroke-width="1.3"
                        />
                        <path
                            d="M6 2.5H19L26 9.5V22"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M6 2.5V29.5H20"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M19 2.5V9.5H26"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                        />
                        <text
                            x="8"
                            y="18"
                            font-family="Arial, sans-serif"
                            font-size="5.5"
                            font-weight="700"
                            fill="currentColor"
                        >EPUB</text>
                        <path
                            d="M15 24H28"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                        />
                        <path
                            d="M23 19L28 24L23 29"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                `;
              btn.className = "mod-download-btn";

              btn.addEventListener("click", async function (e) {
                e.preventDefault();
                e.stopPropagation();
                try {
                  await MOD.fun.downloadEPUB(data);
                } catch (error) {
                  console.error("[MOD] Download lỗi:", error);
                }
              });
              row.appendChild(btn);
            }

            // =====================================================
            // HOOK bookdownloadedrow
            // =====================================================

            // Chưa hook thì mới hook
            if (!window.__MOD_OLD_BOOKDOWNLOADEDROW__) {
              window.__MOD_OLD_BOOKDOWNLOADEDROW__ =
                app.celoader.bookdownloadedrow;

              app.celoader.bookdownloadedrow = function (ele, data) {
                // Hàm gốc tạo row
                const row = window.__MOD_OLD_BOOKDOWNLOADEDROW__.apply(
                  this,
                  arguments,
                );

                // Thêm nút cho row mới
                addDownloadButton(row, data);

                return row;
              };

              console.log("[MOD] Đã hook bookdownloadedrow");
            }

            // =====================================================
            // XỬ LÝ NHỮNG ROW ĐÃ ĐƯỢC TẠO TRƯỚC KHI BẬT MOD
            // =====================================================

            document
              .querySelectorAll(".bookrowcont[view='bookdownloadedrow']")
              .forEach(function (container) {
                const row = container.querySelector(".bookrow");

                if (!row) return;

                // app.render() gán data vào element
                const data = container.data || row.data;

                if (!data) {
                  console.log("[MOD] Không tìm thấy data:", container);
                  return;
                }

                addDownloadButton(row, data);
              });

            console.log("[MOD] Add Download ON");
          },
        },
      ],
    },
    updateGroup,
    {
      title: "JavaScript",
      icon: "fa-code",
      buttons: [
        {
          id: "mod-delete-tempepub",
          icon: "fa-trash",
          label: "Xóa TempEpub",

          fn: async (MOD) => {
            try {
              await Capacitor.Plugins.Filesystem.rmdir({
                path: "TempEpub",
                directory: "DATA",
                recursive: true,
              });

              console.log("[MOD] Đã xóa toàn bộ TempEpub");
              MOD.status("Đã xóa TempEpub");
            } catch (error) {
              console.error("[MOD] Xóa TempEpub lỗi:", error);

              MOD.status("Lỗi: " + (error.message || error));
            }
          },
        },
        {
          id: "mod-delete-datajs",
          icon: "fa-trash",
          label: "Xóa dữ liệu JS",

          fn: async (MOD) => {
            try {
              const result = await SQLite.execute({
                database: "app_v2_db",
                statements: `
                    DELETE FROM mod_scripts;
                `,
                values: [],
              });

              console.log("[MOD] Đã xóa toàn bộ dữ liệu JS");

              MOD.status("Đã xóa toàn bộ dữ liệu JS");
            } catch (error) {
              console.error("[MOD] Xóa dữ liệu JS lỗi:", error);

              MOD.status("Lỗi: " + (error.message || error));
            }
          },
        },
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
        {
          id: "mod-destroy",
          icon: "fa-file-code",
          label: "Hủy Mod",

          fn: (MOD) => {
            try {
              console.log("[MOD] Đang hủy MOD...");

              // =================================================
              // 1. KHÔI PHỤC bookdownloadedrow (nếu đã hook)
              // =================================================
              if (window.__MOD_OLD_BOOKDOWNLOADEDROW__) {
                app.celoader.bookdownloadedrow =
                  window.__MOD_OLD_BOOKDOWNLOADEDROW__;

                delete window.__MOD_OLD_BOOKDOWNLOADEDROW__;

                console.log("[MOD] Đã khôi phục bookdownloadedrow");
              }

              // =================================================
              // 2. XÓA CÁC NÚT DO MOD TẠO (Download...)
              // =================================================
              document
                .querySelectorAll(".mod-download-btn")
                .forEach(function (btn) {
                  btn.remove();
                });

              console.log("[MOD] Đã xóa Download button");

              // =================================================
              // 3. XÓA TAB / NAVBAR / STYLE CỦA MOD
              //    (dùng MOD.remove() - đã biết đúng id thật)
              // =================================================
              MOD.remove();

              // =================================================
              // 4. KHÔI PHỤC console.log GỐC
              // =================================================
              const original = MOD._originalConsoleLog;

              if (typeof original === "function") {
                console.log = original;
              }

              (original || console.log)("[MOD] Hủy MOD hoàn tất");

              // =================================================
              // 5. XÓA MOD SAU CÙNG
              // =================================================
              setTimeout(function () {
                delete window.MOD;

                (original || console.log)("[MOD] MOD đã được xóa");
              }, 100);
            } catch (error) {
              console.error("[MOD] Lỗi khi hủy MOD:", error);
            }
          },
        },
      ],
    },
    {
      title: "WebView",
      icon: "fa-globe",
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
  MOD.fun = MOD.fun || {};
  MOD.isDowload = false;
  MOD.fun.downloadEPUB = async function (data) {
    try {
      if (MOD.isDowload !== false) {
        MOD.showToast("Đang có sách tải không thể thực hiện!");
        return;
      }
      MOD.isDowload = true;
      console.log("===== DOWNLOAD INFO =====");
      console.log("Book:", data);
      console.log("id:", data && data.id);
      console.log("host:", data && data.host);
      console.log("name:", data && data.tname);
      console.log("===== DOWNLOAD =====");

      const root = `epub_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const epub = new EpubDowload(
        root,
        (data.tname || data.name || "book") + ".epub",
      );

      await epub.init();

      const chapterList = await getChapterListCache(data.host, data.id);
      if (!Array.isArray(chapterList)) {
        throw new Error("chapterList không phải Array");
      }
      const builder = new EpubBuilder();

      const b = await builder.createBaseFiles(data, chapterList);
      for (const x of b) {
        await epub.saveFile(x);
      }
      for (let index = 0; index < chapterList.length; index++) {
        try {
          const c = chapterList[index];

          console.log(
            `[MOD] Chapter ${index + 1}/${chapterList.length}:`,
            c.title,
          );

          // Key cache chapter
          const key = data.chapterPreKey + c.cid;
          // Lấy nội dung chapter
          let content = await MOD.fun.GetContent(key);

          if (!content) {
            content = "Không có dữ liệu";
          }

          // Tạo file chapter
          const x = await builder.createChapter(c, content);
          await epub.saveFile(x);
        } catch (error) {
          console.error(`[MOD] Lỗi chapter ${index}:`, error);
        }
      }

      const result = await epub.finish();

      MOD.showToast("[MOD] EPUB hoàn tất:", result);
    } catch (error) {
      MOD.showToast("[MOD] Download EPUB lỗi:", error);
    } finally {
      MOD.isDowload = false;
    }
  };
  MOD.fun.GetContent = async function (key) {
    try {
      const chapter = await getFile(key);

      if (!chapter) {
        return "Không có dữ liệu";
      }

      let json;

      try {
        json = JSON.parse(chapter);
      } catch (e) {
        console.error("[MOD] JSON.parse lỗi:", e);
        return "Dữ liệu không hợp lệ";
      }

      if (!json || !json.data) {
        return "Không có dữ liệu";
      }

      let html = json.data;
      html = html.replace(/<p[^>]*>.*?@Bạn.*?<\/p>/is, "");
      if (MOD.isRaw) {
        const regex = /<i[^>]*?t=['"]([^'"]*)['"][^>]*?>(.*?)<\/i>/gis;

        const raw = html.replace(regex, "$1").replace(/ /g, "");

        return raw.trim();
      }

      html = html.replace(/<i\b[^>]*>(.*?)<\/i>/gis, "<i>$1</i>");

      return html.trim();
    } catch (error) {
      console.error("[MOD] GetContent lỗi:", error);
      return "Lỗi đọc dữ liệu";
    }
  };
  MOD.renderGroup();
})();
