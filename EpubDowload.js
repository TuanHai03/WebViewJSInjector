(() => {
  "use strict";

  // ========================================================= 
  //  CONSTRUCTOR 
  //  tempName: Tên thư mục tạm. 
  //  outputFileName: Tên file xuất cuối cùng. 
  // Ví dụ:  new EpubDowload( "Epub123", "book.epub"  ); 
  // DATA sẽ là: /data/user/0/com.sangtacviet.mobilereader/files/tempEpub/Epub123
  // // =========================================================
    constructor(tempName, outputFileName) 
    { 
        if (!tempName) { throw new Error("tempName is required"); } 
        if (!outputFileName) { throw new Error("outputFileName is required"); } 
        // ------------------------------------------------------- 
        // Làm sạch tên thư mục // ------------------------------------------------------- 
        this.tempName = String(tempName) .replace(/^\/+|\/+$/g, ""); 
        // ------------------------------------------------------- 
        // Làm sạch tên file 
        // ------------------------------------------------------- 
        this.fileName = EpubDowload.toValidFileName( outputFileName ); 
        // ------------------------------------------------------- 
        // Root thực tế 
        // ------------------------------------------------------- 
        this.root = `TempEpub/${this.tempName}`; 
        this.inited = false; this.finished = false; 
    }

    // =========================================================
    // INIT
    //
    // Chỉ tạo thư mục root.
    // Không tạo file nào ở đây.
    //
    // =========================================================

    async init() {
      if (this.inited) {
        return this;
      }

      const FS = Capacitor.Plugins.Filesystem;

      await FS.mkdir({
        path: this.root,
        directory: "DATA",
        recursive: true,
      });

      this.inited = true;

      console.log("EPUB root:", this.root);

      return this;
    }

    // =========================================================
    // SAVE FILE
    //
    // Tất cả file đều dùng chung một format:
    //
    // {
    //   path: "OEBPS/Text/introduction.xhtml",
    //   data: "..."
    // }
    //
    // data có thể là:
    //   String
    //   Blob
    //
    // =========================================================

    async saveFile(file) {
      if (!this.inited) {
        throw new Error("Phải gọi init() trước khi saveFile()");
      }

      if (this.finished) {
        throw new Error("EPUB đã finish(), không thể saveFile()");
      }

      if (!file || typeof file !== "object") {
        throw new Error("File không hợp lệ");
      }

      if (!file.path) {
        throw new Error("File phải có path");
      }

      if (typeof file.data === "undefined" || file.data === null) {
        throw new Error(`File không có data: ${file.path}`);
      }

      const FS = Capacitor.Plugins.Filesystem;

      // -------------------------------------------------------
      // Tạo thư mục cha
      // -------------------------------------------------------

      await EpubDowload.ensureDir(FS, this.root, file.path);

      // -------------------------------------------------------
      // Convert data -> Base64
      // -------------------------------------------------------

      const base64Data = await EpubDowload.dataToBase64(file.data);

      // -------------------------------------------------------
      // Ghi file
      // -------------------------------------------------------

      await FS.writeFile({
        path: `${this.root}/${file.path}`,

        directory: "DATA",

        data: base64Data,
      });

      console.log("Đã lưu:", file.path);

      return file.path;
    }

    // =========================================================
    // SAVE FILES
    //
    // Cho phép:
    //
    // await epub.saveFiles([
    //   { path, data },
    //   { path, data },
    // ]);
    //
    // Các file được lưu tuần tự.
    //
    // =========================================================

    async saveFiles(files) {
      if (!Array.isArray(files)) {
        throw new Error("files phải là array");
      }

      for (const file of files) {
        await this.saveFile(file);
      }

      return this;
    }

    // =========================================================
    // FINISH
    //
    // 1. ZIP toàn bộ root
    // 2. ZIP thành công
    // 3. Xóa root
    //
    // Nếu ZIP lỗi:
    // -> giữ nguyên root
    //
    // =========================================================

    async finish() {
      if (!this.inited) {
        throw new Error("Phải gọi init() trước khi finish()");
      }

      if (this.finished) {
        throw new Error("EPUB đã finish()");
      }

      const FS = Capacitor.Plugins.Filesystem;

      try {
        console.log("Bắt đầu đóng gói EPUB:", this.root);

        // -----------------------------------------------------
        // ZIP
        // -----------------------------------------------------

        const result = await FS.zipDirectory({
          dir: this.root,
          fileName: this.fileName,
        });

        console.log("ZIP thành công:", result);

        // -----------------------------------------------------
        // ZIP thành công mới xóa root
        // -----------------------------------------------------

        await EpubDowload.cleanup(this.root);

        this.finished = true;

        console.log("Đã hoàn tất EPUB:", this.fileName);

        return result;
      } catch (e) {
        // -----------------------------------------------------
        // ZIP thất bại
        //
        // KHÔNG xóa root
        // để có thể kiểm tra / retry
        // -----------------------------------------------------

        console.error("EPUB FINISH ERROR:", e);

        throw e;
      }
    }

    // =========================================================
    // CANCEL
    //
    // Xóa root khi người dùng hủy hoặc xảy ra lỗi
    // trong quá trình tạo EPUB.
    //
    // =========================================================

    async cancel() {
      if (this.finished) {
        return;
      }

      await EpubDowload.cleanup(this.root);

      this.inited = false;

      console.log("Đã hủy EPUB:", this.root);
    }

    // =========================================================
    // STRING -> BASE64
    //
    // Hỗ trợ Unicode / tiếng Việt.
    //
    // =========================================================

    static textToBase64(text) {
      return btoa(unescape(encodeURIComponent(String(text))));
    }

    // =========================================================
    // BLOB -> BASE64
    // =========================================================

    static blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const result = String(reader.result);

          const index = result.indexOf(",");

          if (index < 0) {
            reject(new Error("Không thể convert Blob sang Base64"));
            return;
          }

          resolve(result.substring(index + 1));
        };

        reader.onerror = () => {
          reject(reader.error || new Error("FileReader error"));
        };

        reader.readAsDataURL(blob);
      });
    }

    // =========================================================
    // DATA -> BASE64
    //
    // String -> Base64
    // Blob   -> Base64
    //
    // =========================================================

    static async dataToBase64(data) {
      if (data instanceof Blob) {
        return await EpubDowload.blobToBase64(data);
      }

      return EpubDowload.textToBase64(data);
    }

    // =========================================================
    // TẠO THƯ MỤC CHA
    //
    // Ví dụ:
    //
    // filePath:
    // OEBPS/Text/chapter_1.xhtml
    //
    // tạo:
    // root/OEBPS/Text
    //
    // =========================================================

    static async ensureDir(FS, root, filePath) {
      const parts = String(filePath).split("/");

      // Bỏ tên file
      parts.pop();

      // File nằm trực tiếp trong root
      //
      // ví dụ:
      // mimetype
      //
      if (parts.length === 0) {
        return;
      }

      const dirPath = `${root}/${parts.join("/")}`;

      await FS.mkdir({
        path: dirPath,
        directory: "DATA",
        recursive: true,
      });
    }

    // =========================================================
    // CLEANUP
    //
    // Xóa toàn bộ root.
    //
    // =========================================================

    static async cleanup(root) {
      if (!root) {
        return;
      }

      const FS = Capacitor.Plugins.Filesystem;

      try {
        await FS.rmdir({
          path: root,
          directory: "DATA",
          recursive: true,
        });

        console.log("Đã xóa root:", root);
      } catch (e) {
        // Không tồn tại cũng không phải lỗi nghiêm trọng
        console.log("Root không tồn tại hoặc đã được xóa:", root);
      }
    }

static toValidFileName(name, defaultName = "Book") {

    let result = String(name || "").trim();

    // Ký tự không hợp lệ trên Windows / Android
    result = result.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

    // Không để kết thúc bằng dấu chấm hoặc khoảng trắng
    result = result.replace(/[. ]+$/g, "");

    // Xử lý tên rỗng
    if (!result) {
        result = defaultName;
    }

    // Tránh tên đặc biệt của Windows
    if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(result)) {
        result = "_" + result;
    }

    return result;
}

  }

  // ===========================================================
  // EXPORT
  // ===========================================================

  window.EpubDowload = EpubDowload;
})();
