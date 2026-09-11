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
    //         title: "Tên card",     // tiêu đề khối
    //         icon:  "fa-xxx",       // icon FontAwesome của card
    //         buttons: [
    //             {
    //                 id:    "id-duy-nhat",   // id, không trùng
    //                 icon:  "fa-xxx",        // icon nút
    //                 label: "Chữ trên nút",
    //                 fn:    (MOD) => { ... } // code chạy khi bấm
    //             },
    //             ...
    //         ]
    //     },
    //     ...
    // ]
    //
    // Thêm nút mới: chỉ cần thêm 1 object vào mảng `buttons`
    // của card tương ứng (hoặc tạo card mới).
    // Hàm `fn` nhận vào `MOD`, dùng `MOD.status("...")` để
    // cập nhật dòng trạng thái, và `console.log(...)` bình thường.
    // =========================================================

    const BUTTON_GROUPS = [

        {
            title: "Console",
            icon: "fa-terminal",
            buttons: [
                {
                    id: "mod-fix-login",
                    icon: "fa-terminal",
                    label: "Fix-Login",
                    fn: (MOD) => {
                app.net.networkManagerXHR.defaultDomains =
                app.net.networkManagerXHR.defaultDomains.filter(
                    x => x !== "https://sangtacviet.com"
                    );

                    }
                },
                {
                    id: "mod-console-test",
                    icon: "fa-terminal",
                    label: "Test Console",
                    fn: (MOD) => {

                        console.log("========================");
                        console.log("[MOD] Console OK");
                        console.log("URL:", location.href);
                        console.log("mainview:", document.getElementById("mainview"));
                        console.log("========================");

                        MOD.status("Console hoạt động");
                    }
                },
                {
                    id: "mod-console-clear",
                    icon: "fa-trash",
                    label: "Clear Console",
                    fn: (MOD) => {

                        console.clear();

                        MOD.status("Đã Clear Console");
                    }
                }
            ]
        },

        {
            title: "JavaScript",
            icon: "fa-code",
            buttons: [
                {
                    id: "mod-page-info",
                    icon: "fa-info-circle",
                    label: "Thông tin Web",
                    fn: (MOD) => {

                        console.log({
                            url: location.href,
                            title: document.title,
                            readyState: document.readyState,
                            app: window.app,
                            ui: window.ui,
                            mainview: document.getElementById("mainview"),
                            maintabdiv: document.getElementById("maintabdiv")
                        });

                        MOD.status("Đã xuất thông tin Web");
                    }
                },
                {
                    id: "mod-script-list",
                    icon: "fa-file-code",
                    label: "Danh sách Script",
                    fn: (MOD) => {

                        const list =
                            Array.from(document.scripts)
                                .map(x => x.src || "[inline]");

                        console.log("[MOD] Scripts:", list);

                        MOD.status(`Có ${list.length} script`);
                    }
                }
            ]
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

                        console.log(location.href);

                        MOD.status(location.href);
                    }
                }
            ]
        }

        // -----------------------------------------------------
        // Ví dụ thêm 1 card + 1 nút mới:
        //
        // {
        //     title: "Card mới",
        //     icon: "fa-flask",
        //     buttons: [
        //         {
        //             id: "mod-my-button",
        //             icon: "fa-flask",
        //             label: "Chức năng mới",
        //             fn: (MOD) => {
        //                 console.log("[MOD] Chạy hàm mới");
        //                 MOD.status("Đã chạy hàm mới");
        //             }
        //         }
        //     ]
        // }
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
        // START
        // =====================================================

        init() {

            // -------------------------------------------------
            // GUARD: chỉ chạy khi URL đúng app mục tiêu
            // -------------------------------------------------
            if (!location.href.includes(ALLOWED_URL_MATCH)) {

                console.log(
                    `%c[MOD] Bỏ qua - URL không khớp "${ALLOWED_URL_MATCH}"`,
                    "color:#aa0000;font-weight:bold"
                );

                console.log(
                    "[MOD] URL hiện tại:",
                    location.href
                );

                return;
            }


            const mainview =
                document.getElementById("mainview");

            const maintabdiv =
                document.getElementById("maintabdiv");

            const navbar =
                document.getElementById("mainnavbar");


            if (!mainview ||
                !maintabdiv ||
                !navbar) {

                console.error(
                    "[MOD] Không tìm thấy mainview / maintabdiv / mainnavbar"
                );

                return;
            }


            // Không tạo trùng

            if (document.getElementById(this.tabId)) {
                console.log("[MOD] Đã tồn tại");
                return;
            }


            this.createStyle();

            this.createTab(maintabdiv);

            this.createNavbar(navbar);

            this.bindEvents();

            this.resizeTabs(maintabdiv);

            console.log(
                "%c[MOD] Tab 5 đã được tạo",
                "color:#00aa00;font-weight:bold"
            );
        },


        // =====================================================
        // STYLE
        // =====================================================

        createStyle() {

            const style =
                document.createElement("style");

            style.id = this.styleId;

            style.textContent = `

                #${this.tabId} {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    overflow: auto;
                    position: relative;
                    background: #f5f5f5;
                }

                #${this.tabId} .mod-page {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    background: #f5f5f5;
                }

                #${this.tabId} .mod-header {
                    height: 55px;
                    min-height: 55px;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    background: #333;
                    color: white;
                }

                #${this.tabId} .mod-back {
                    width: 55px;
                    height: 55px;
                    border: 0;
                    background: transparent;
                    color: white;
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
                }

                #${this.tabId} .mod-content {
                    flex: 1;
                    overflow: auto;
                    box-sizing: border-box;
                    padding: 15px;
                }

                #${this.tabId} .mod-card {
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 12px;
                    box-sizing: border-box;
                    box-shadow: 0 2px 5px rgba(0,0,0,.12);
                }

                #${this.tabId} .mod-card-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                #${this.tabId} .mod-button {
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 12px;
                    margin-top: 7px;
                    border: 0;
                    border-radius: 6px;
                    background: #eee;
                    text-align: left;
                    font-size: 14px;
                    cursor: pointer;
                }

                #${this.tabId} .mod-button:active {
                    transform: scale(.98);
                }

                #${this.tabId} .mod-status {
                    font-size: 13px;
                    color: #777;
                    word-break: break-word;
                }

            `;

            document.head.appendChild(style);
        },


        // =====================================================
        // TẠO HTML CHO 1 CARD (dựa theo BUTTON_GROUPS)
        // =====================================================

        renderGroup(group) {

            const buttonsHtml =
                group.buttons.map(btn => `
                    <button class="mod-button" id="${btn.id}">
                        <i class="fas ${btn.icon}"></i>
                        ${btn.label}
                    </button>
                `).join("");

            return `
                <div class="mod-card">
                    <div class="mod-card-title">
                        <i class="fas ${group.icon}"></i>
                        ${group.title}
                    </div>
                    ${buttonsHtml}
                </div>
            `;
        },


        // =====================================================
        // CREATE MOD TAB
        // =====================================================

        createTab(maintabdiv) {

            const tab =
                document.createElement("tabview");

            tab.id = this.tabId;


            const groupsHtml =
                BUTTON_GROUPS
                    .map(group => this.renderGroup(group))
                    .join("");


            tab.innerHTML = `

                <div class="mod-page">

                    <!-- HEADER -->
                    <div class="mod-header">

                        <button class="mod-back" id="mod-go-back">
                            <i class="fas fa-arrow-left"></i>
                        </button>

                        <div class="mod-title">
                            <i class="fas fa-tools"></i>
                            MOD
                        </div>

                    </div>

                    <!-- CONTENT (sinh tự động từ BUTTON_GROUPS) -->
                    <div class="mod-content">

                        ${groupsHtml}

                        <!-- STATUS -->
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


            /*
             * Thêm vào maintabdiv.
             * Không đụng 4 tab cũ.
             */

            maintabdiv.appendChild(tab);

            this.tab = tab;
        },


        // =====================================================
        // CREATE NAVBAR ITEM
        // =====================================================

        createNavbar(navbar) {

            const item =
                document.createElement("tabitem");

            item.id = this.navId;

            const firstItem =
                navbar.querySelector("tabitem");

            if (firstItem) {
                item.className = firstItem.className;
            } else {
                item.className =
                    "iconbtn waves-effect waves-light";
            }

            // Xóa active nếu bị copy từ tab gốc
            item.classList.remove("active");

            item.innerHTML = `
                <i class="fas fa-tools"></i>
                <text>MOD</text>
            `;

            navbar.appendChild(item);

            this.navItem = item;
        },


        // =====================================================
        // RESIZE NAVBAR ITEM
        // =====================================================

        resizeTabs(maintabdiv) {

            this.container = maintabdiv;

            const navbar =
                document.getElementById("mainnavbar");

            if (!navbar) {
                console.warn("[MOD] Không tìm thấy #mainnavbar");
                return;
            }

            const items =
                Array.from(navbar.querySelectorAll("tabitem"));

            if (items.length === 0) {
                return;
            }

            const itemCount = items.length;

            const width = `${100 / itemCount}%`;

            items.forEach(item => {
                item.style.width = width;
                item.style.minWidth = width;
                item.style.maxWidth = width;
                item.style.flex = `0 0 ${width}`;
                item.style.boxSizing = "border-box";
            });

            if (this.navItem) {
                this.navItem.style.width = width;
                this.navItem.style.minWidth = width;
                this.navItem.style.maxWidth = width;
                this.navItem.style.flex = `0 0 ${width}`;
            }

            console.log(
                `[MOD] Navbar: ${itemCount} tab, mỗi tab ${width}`
            );
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
                true
            );

            // GO BACK
            document
                .getElementById("mod-go-back")
                .addEventListener("click", () => {
                    this.goBack();
                });

            // Gắn tất cả nút định nghĩa trong BUTTON_GROUPS
            BUTTON_GROUPS.forEach(group => {

                group.buttons.forEach(btn => {

                    const el = document.getElementById(btn.id);

                    if (!el) {
                        console.warn(`[MOD] Không tìm thấy nút #${btn.id}`);
                        return;
                    }

                    el.addEventListener("click", () => {
                        btn.fn(MOD);
                    });
                });
            });
        },


        // =====================================================
        // OPEN MOD
        // =====================================================

        open() {

            const mainview =
                document.getElementById("mainview");

            if (mainview && typeof mainview.current === "function") {

                const current = mainview.current();

                if (typeof current === "number") {
                    this.previousTab = current;
                }
            }

            this.navItem.classList.add("active");

            this.navbar =
                document.getElementById("mainnavbar");

            if (this.navbar) {
                this.navbar.style.display = "none";
            }

            this.tab.style.position = "absolute";
            this.tab.style.left = "0";
            this.tab.style.top = "0";
            this.tab.style.width = "100%";
            this.tab.style.height = "100%";
            this.tab.style.zIndex = "9999";
            this.tab.style.display = "block";

            this.status("MOD đang mở");

            console.log(
                "[MOD] Open - previous tab:",
                this.previousTab
            );
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

            if (this.navbar) {
                this.navbar.style.display = "";
            }

            this.navItem.classList.remove("active");

            console.log(
                "[MOD] GoBack ->",
                this.previousTab
            );
        },


        // =====================================================
        // STATUS
        // =====================================================

        status(text) {

            const status =
                document.getElementById("mod-status");

            if (status) {
                status.textContent = text;
            }
        },


        // =====================================================
        // REMOVE
        // =====================================================

        remove() {

            this.tab?.remove();
            this.navItem?.remove();
            document.getElementById(this.styleId)?.remove();

            console.log("[MOD] Removed");
        }
    };


    // =========================================================
    // GLOBAL
    // =========================================================

    window.MOD = MOD;

    MOD.init();

})();
