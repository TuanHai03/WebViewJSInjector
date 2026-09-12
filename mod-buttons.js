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
  // File này PHẢI được nạp SAU mod-core.js (vì cần window.MOD
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

  if (!window.MOD) {
    console.error(
      "[MOD] mod-core.js chưa được nạp - hãy nạp mod-core.js trước mod-buttons.js",
    );
    return;
  }

  // Điều kiện app được phép chạy MOD. Sửa ở đây nếu cần đổi.
  window.MOD.ALLOWED_URL_MATCH = "/app.v2.php";

  window.MOD.BUTTON_GROUPS = [
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

              btn.addEventListener("click", async function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log("===== DOWNLOAD =====");
                console.log("Book:", data);
                console.log("lid:", data && data.lid);
                console.log("id:", data && data.id);
                console.log("host:", data && data.host);
                console.log("name:", data && data.name);

                // =====================================================
                // LẤY THÔNG TIN BOOK
                // =====================================================

                try {
                  const host = data.host;
                  const bookId = data.id;

                  console.log("===== BOOK INFO =====");
                  console.log("host:", host);
                  console.log("id:", bookId);
                  console.log("name:", data.name);
                  console.log("author:", data.author);

                  // ===================================================
                  // LẤY CHAPTER LIST
                  // ===================================================

                  const chapterList = await getChapterListCache(host, bookId);

                  console.log("===== CHAPTER LIST =====");
                  console.log("Total:", chapterList.length);
                  console.table(chapterList);

                  // ===================================================
                  // LẤY OFFLINE BOOK
                  // ===================================================

                  const book = app.offlineBook.getSingleton(host, bookId);

                  console.log("OfflineBook:", book);

                  // ===================================================
                  // LẤY DANH SÁCH CHAPTER ĐÃ DOWNLOAD
                  // ===================================================

                  const downloadedIds = await book.getChapterDownloaded();

                  console.log("===== DOWNLOADED CHAPTERS =====");
                  console.log("Total:", downloadedIds.length);
                  console.log(downloadedIds);

                  // ===================================================
                  // TẠO SET ĐỂ KIỂM TRA CHAPTER ĐÃ DOWNLOAD
                  // ===================================================

                  const downloadedSet = new Set(
                    downloadedIds.map(function (id) {
                      return String(id);
                    }),
                  );

                  // ===================================================
                  // LẤY CONTENT
                  // ===================================================

                  const chapters = [];

                  for (let i = 0; i < chapterList.length; i++) {
                    const chapter = chapterList[i];

                    if (!chapter) {
                      continue;
                    }

                    const cid = String(chapter.cid);

                    // Chưa download thì bỏ qua
                    if (!downloadedSet.has(cid)) {
                      continue;
                    }

                    const title = chapter.title
                      ? String(chapter.title).trim()
                      : "";

                    const content = await book.getChapter(cid);

                    chapters.push({
                      cid: cid,
                      title: title,
                      content: content || "",
                    });

                    console.log(
                      "CHAPTER:",
                      cid,
                      title,
                      "size:",
                      content ? content.length : 0,
                    );
                  }

                  // ===================================================
                  // KẾT QUẢ
                  // ===================================================

                  console.log("===== DOWNLOAD DATA =====");

                  console.log("Tổng chapter:", chapterList.length);

                  console.log("Đã download:", downloadedIds.length);

                  console.log("Đọc được:", chapters.length);

                  console.table(
                    chapters.map(function (chapter) {
                      return {
                        cid: chapter.cid,
                        title: chapter.title,
                        size: chapter.content.length,
                      };
                    }),
                  );

                  // ===================================================
                  // IN CONTENT
                  // ===================================================

                  for (let i = 0; i < chapters.length; i++) {
                    console.log("===== CHAPTER " + (i + 1) + " =====");

                    console.log("CID:", chapters[i].cid);

                    console.log("TITLE:", chapters[i].title);

                    console.log("CONTENT:", chapters[i].content);
                  }

                  // ===================================================
                  // DATA CHO CREATE EPUB
                  // ===================================================

                  const epubData = {
                    book: data,
                    host: host,
                    id: bookId,
                    lid: data.lid,
                    name: data.name,
                    author: data.author,
                    chapters: chapters,
                  };

                  console.log("===== EPUB DATA =====");
                  console.log(epubData);

                  // ===================================================
                  // GỌI CREATE EPUB
                  // ===================================================

                  if (typeof createEpub === "function") {
                    console.log("[MOD] Gọi createEpub()");

                    await createEpub(epubData);
                  } else {
                    console.log("[MOD] Chưa có createEpub");
                  }
                } catch (error) {
                  console.error("[MOD] DOWNLOAD ERROR:", error);
                }
              });

              const tags = row.querySelector(".tags");

              if (tags) {
                tags.appendChild(btn);
              }
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
              // 5. XÓA window.MOD SAU CÙNG
              // =================================================
              setTimeout(function () {
                delete window.MOD;

                (original || console.log)("[MOD] window.MOD đã được xóa");
              }, 100);
            } catch (error) {
              console.error("[MOD] Lỗi khi hủy MOD:", error);
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
})();
