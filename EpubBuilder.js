(() => {
  "use strict";

  class EpubBuilder {
    constructor(options = {}) {
      this.options = options || {};
      this.imageCounter = 0;
    }

    // =========================================================
    // RESET
    // =========================================================

    reset() {
      this.imageCounter = 0;
    }

    createMimetype() {
      return "application/epub+zip";
    }

    createContainerXml() {
      return `<?xml version="1.0" encoding="UTF-8"?>
                    <container version="1.0"
                        xmlns="urn:oasis:names:tc:opendocument:xmlns:container">

                        <rootfiles>
                            <rootfile
                                full-path="OEBPS/content.opf"
                                media-type="application/oebps-package+xml"/>
                        </rootfiles>

                    </container>`;
    }

    createStyle() {
      return `
        body { font-family: sans-serif; line-height: 1.6; padding: 1em; }

        h1 { text-align: center; }

        p { margin: 0.5em 0; text-align: justify; }
        `.trim();
    }

    createIntroduction(book) {
      // =========================================================
      // BOOK INFO
      // =========================================================

      const title = this.escapeXml(book && book.tname ? book.tname : "");

      const author = this.escapeXml(book && book.hauthor ? book.hauthor : "");

      const category = this.escapeXml(
        book && book.category ? book.category.trim() : "",
      );

      // =========================================================
      // DESCRIPTION
      // =========================================================

      const info = book && book.info ? String(book.info) : "";

      const infoHtml = this.escapeXml(info)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .filter(function (line) {
          return line.trim() !== "";
        })
        .map(function (line) {
          return `    <p>${line}</p>`;
        })
        .join("\n");

      // =========================================================
      // XHTML
      // =========================================================

      return `<?xml version="1.0" encoding="UTF-8"?>

            <!DOCTYPE html>

            <html
                xmlns="http://www.w3.org/1999/xhtml"
                lang="vi">

            <head>

                <meta charset="UTF-8"/>

                <title>Giới thiệu</title>

                <link
                    href="../Styles/style.css"
                    rel="stylesheet"
                    type="text/css"/>

            </head>

            <body>

                <h1>${title}</h1>

                <p>
                    <strong>Tác giả:</strong>
                    ${author}
                </p>

                <p>
                    <strong>Thể loại:</strong>
                    ${category}
                </p>

                ${infoHtml}

            </body>

            </html>`;
    }
    async createCover(source) {
      try {
        if (source == null || source === "") {
          return null;
        }
        let blob = null;

        if (typeof source === "string") {
          const response = await fetch(source);

          if (!response.ok) {
            return null;
          }

          blob = await response.blob();
        } else if (source instanceof Blob) {
          blob = source;
        } else {
          return null;
        }

        if (!blob || blob.size === 0) {
          return null;
        }

        let ext = "jpg";

        if (blob.type === "image/png") {
          ext = "png";
        } else if (blob.type === "image/webp") {
          ext = "webp";
        } else if (blob.type === "image/gif") {
          ext = "gif";
        }

        return {
          path: `OEBPS/Images/cover.${ext}`,
          data: blob,
          href: `Images/cover.${ext}`,
          mediaType: blob.type || "image/jpeg",
        };
      } catch (e) {
        console.warn("Không tải được cover:", e);
        return null;
      }
    }
    async createBaseFiles(book, chapterInfos = [], CoverSource = null) {
      this.reset();
      const title = this.escapeXml(book && book.tname ? book.tname : "");
      const author = this.escapeXml(book && book.hauthor ? book.hauthor : "");

      const description =
        book && book.info != null
          ? `        <dc:description>${this.escapeXml(book.info)}</dc:description>\n`
          : "";
      const uuid = this.uuid();
      if (CoverSource == null) {
        CoverSource = book && book.thumb ? book.thumb : null;
      }
      const cover = await this.createCover(CoverSource);
      let links = "";
      let chapterItems = "";
      let manifestItems = "";
      let spineItems = "";
      for (let index = 0; index < chapterInfos.length; index++) {
        const chapter = chapterInfos[index];

        const chapterTitle =
          chapter && chapter.title ? chapter.title : `Chapter ${index + 1}`;
        const id =
          chapter && chapter.cid ? chapter.cid : `Chapter_${index + 1}`;
        const escapedTitle = this.escapeXml(chapterTitle);

        links += `<a href="../Text/${id}.xhtml">${escapedTitle}</a><br/>`;

        chapterItems += `            <li><a href="Text/${id}.xhtml">${escapedTitle}</a></li>`;

        manifestItems += `        <item id="${id}" href="Text/${id}.xhtml" media-type="application/xhtml+xml"/>`;

        spineItems += `        <itemref idref="${id}"/>`;

        if (index < chapterInfos.length - 1) {
          links += "\n";
          chapterItems += "\n";
          manifestItems += "\n";
          spineItems += "\n";
        }
      }

      // =========================================================
      // Cover tùy chọn
      // =========================================================
      let coverMeta = "";
      let coverItem = "";
      if (cover) {
        coverMeta = `        <meta name="cover" content="cover"/>\n`;

        coverItem = `        <item id="cover" href="${cover.href}" media-type="${cover.mediaType}" properties="cover-image"/>\n`;
      }

      const xmlToc = `<?xml version="1.0" encoding="utf-8"?>

                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
                "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">

                <html xmlns="http://www.w3.org/1999/xhtml">

                <head>

                    <title>${title}</title>

                    <link
                        href="../Styles/style.css"
                        rel="stylesheet"
                        type="text/css"/>

                    <meta
                        http-equiv="Content-Type"
                        content="text/html; charset=utf-8"/>

                </head>

                <body>

                <h1>Mục lục</h1>

                <br/>

                ${links}

                </body>

                </html>`;

      const xmlNav =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<!DOCTYPE html>\n` +
        `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\n` +
        `<head>\n` +
        `    <title>${title}</title>\n` +
        `</head>\n` +
        `<body>\n` +
        `    <nav epub:type="toc" id="toc">\n` +
        `        <h1>Mục lục</h1>\n` +
        `        <ol>\n` +
        `            <li><a href="Text/introduction.xhtml">Giới thiệu</a></li>\n` +
        `            <li><a href="Text/toc.xhtml">Mục lục</a></li>\n` +
        `${chapterItems}\n` +
        `        </ol>\n` +
        `    </nav>\n` +
        `</body>\n` +
        `</html>`;

      const xmlOpf =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">\n` +
        `    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
        `        <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>\n` +
        `        <dc:title>${title}</dc:title>\n` +
        `        <dc:creator>${author}</dc:creator>\n` +
        coverMeta +
        `        <dc:language>vi</dc:language>\n` +
        description +
        `    </metadata>\n` +
        `    <manifest>\n` +
        `        <item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>\n` +
        `        <item id="style" href="Styles/style.css" media-type="text/css"/>\n` +
        `        <item id="intro" href="Text/introduction.xhtml" media-type="application/xhtml+xml"/>\n` +
        coverItem +
        `        <item id="tocpage" href="Text/toc.xhtml" media-type="application/xhtml+xml"/>\n` +
        manifestItems +
        `\n` +
        `    </manifest>\n` +
        `    <spine>\n` +
        `        <itemref idref="intro"/>\n` +
        `        <itemref idref="tocpage"/>\n` +
        spineItems +
        `\n` +
        `    </spine>\n` +
        `</package>`;

      const files = [
        {
          path: "mimetype",
          data: this.createMimetype(),
        },
        {
          path: "META-INF/container.xml",
          data: this.createContainerXml(),
        },
        {
          path: "OEBPS/Styles/style.css",
          data: this.createStyle(),
        },
        {
          path: "OEBPS/Text/introduction.xhtml",
          data: this.createIntroduction(book),
        },
        {
          path: "OEBPS/Text/toc.xhtml",
          data: xmlToc,
        },
        {
          path: "OEBPS/nav.xhtml",
          data: xmlNav,
        },
        {
          path: "OEBPS/content.opf",
          data: xmlOpf,
        },
      ];
      if (cover) {
        files.push({
          path: cover.path,
          data: cover.data,
        });
      }

      return files;
    }

    // =========================================================
    // Chapter
    // =========================================================
    createChapter(chapter, content) {
      const id = chapter && chapter.cid ? chapter.cid : `Chapter_${index + 1}`;
      const chapterTitle =
        chapter && chapter.title ? chapter.title : `Chapter ${index + 1}`;
      const html = `<?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>${this.escapeXml(chapterTitle)}</title>
                <link href="../Styles/style.css" rel="stylesheet" type="text/css"/>
            </head>
            <body>
                <h1>${this.escapeXml(chapterTitle)}</h1>
                ${content}
            </body>
            </html>`;
      return {
        path: `OEBPS/Text/${id}`,
        data: html,
      };
    }

    // =========================================================
    // XML
    // =========================================================

    escapeXml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    // =========================================================
    // UUID
    // =========================================================

    uuid() {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }

      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;

          const v = c === "x" ? r : (r & 0x3) | 0x8;

          return v.toString(16);
        },
      );
    }
  }

  // =============================================================
  // EXPORT
  // =============================================================

  window.EpubBuilder = EpubBuilder;
})();
