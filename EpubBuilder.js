(() => {
    "use strict";

    class EpubBuilder {

        constructor(options = {}) {
            this.options = options;

            this.imageCounter = 0;
        }

        /**
         * Reset trạng thái khi bắt đầu tạo một EPUB mới.
         */
        reset() {
            this.imageCounter = 0;
        }

        // =========================================================
        // BASE FILES
        // =========================================================

        /**
         * Tạo toàn bộ các file cơ bản của EPUB.
         *
         * Không tạo chapter.
         * Không tạo ZIP.
         * Không download.
         *
         * @param {Object} book
         * @param {Array} chapterInfos
         * @returns {Object}
         */
        createBaseFiles(book, chapterInfos = []) {

            this.reset();

            const files = [];

            files.push({
                path: "mimetype",
                data: this.createMimetype()
            });

            files.push({
                path: "META-INF/container.xml",
                data: this.createContainerXml()
            });

            files.push({
                path: "OEBPS/Styles/style.css",
                data: this.createStyle()
            });

            files.push({
                path: "OEBPS/Text/introduction.xhtml",
                data: this.createIntroduction(book)
            });

            files.push({
                path: "OEBPS/Text/toc.xhtml",
                data: this.createToc(book, chapterInfos)
            });

            files.push({
                path: "OEBPS/nav.xhtml",
                data: this.createNav(book, chapterInfos)
            });

            files.push({
                path: "OEBPS/content.opf",
                data: this.createContentOpf(
                    book,
                    chapterInfos
                )
            });

            return files;
        }


        /**
         * EPUB mimetype.
         */
        createMimetype() {
            return "application/epub+zip";
        }


        /**
         * META-INF/container.xml
         */
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


        /**
         * CSS cơ bản.
         *
         * Có thể thay nội dung bằng CSS hiện tại
         * của EpubExporter cũ.
         */
        createStyle() {

            return `
body {
    margin: 0;
    padding: 0;
    line-height: 1.6;
    font-family: sans-serif;
}

h1, h2, h3 {
    text-align: center;
}

img {
    max-width: 100%;
    height: auto;
}

.chapter {
    margin: 0;
    padding: 0;
}

.center {
    text-align: center;
}
`.trim();
        }


        /**
         * introduction.xhtml
         */
        createIntroduction(book) {

            const title = this.escapeXml(
                book?.title || ""
            );

            const author = this.escapeXml(
                book?.author || ""
            );

            return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <title>${title}</title>
    <link
        rel="stylesheet"
        type="text/css"
        href="../Styles/style.css"/>
</head>

<body>

    <h1>${title}</h1>

    ${
        author
            ? `<p class="center">${author}</p>`
            : ""
    }

</body>

</html>`;
        }


        /**
         * toc.xhtml
         */
        createToc(book, chapterInfos = []) {

            const title = this.escapeXml(
                book?.title || "Table of Contents"
            );

            let items = "";

            for (let i = 0; i < chapterInfos.length; i++) {

                const chapter = chapterInfos[i];

                const chapterTitle = this.escapeXml(
                    chapter?.title ||
                    `Chapter ${i + 1}`
                );

                items += `
<li>
    <a href="chapter_${i + 1}.xhtml">
        ${chapterTitle}
    </a>
</li>`;
            }

            return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <title>${title}</title>

    <link
        rel="stylesheet"
        type="text/css"
        href="../Styles/style.css"/>
</head>

<body>

<h1>${title}</h1>

<ol>
${items}
</ol>

</body>

</html>`;
        }


        /**
         * nav.xhtml
         */
        createNav(book, chapterInfos = []) {

            const title = this.escapeXml(
                book?.title || "Navigation"
            );

            let items = "";

            for (let i = 0; i < chapterInfos.length; i++) {

                const chapter = chapterInfos[i];

                const chapterTitle = this.escapeXml(
                    chapter?.title ||
                    `Chapter ${i + 1}`
                );

                items += `
<li>
    <a href="Text/chapter_${i + 1}.xhtml">
        ${chapterTitle}
    </a>
</li>`;
            }

            return `<?xml version="1.0" encoding="UTF-8"?>

<html
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:epub="http://www.idpf.org/2007/ops">

<head>
    <title>${title}</title>
</head>

<body>

<nav epub:type="toc" id="toc">

    <h1>${title}</h1>

    <ol>
        ${items}
    </ol>

</nav>

</body>

</html>`;
        }


        /**
         * content.opf
         *
         * Chỉ cần chapterInfos.
         * Không cần chapter content.
         */
        createContentOpf(book, chapterInfos = []) {

            const title = this.escapeXml(
                book?.title || "Book"
            );

            const author = this.escapeXml(
                book?.author || ""
            );

            const uuid = this.uuid();

            let manifest = `
<item
    id="css"
    href="Styles/style.css"
    media-type="text/css"/>

<item
    id="introduction"
    href="Text/introduction.xhtml"
    media-type="application/xhtml+xml"/>

<item
    id="toc"
    href="Text/toc.xhtml"
    media-type="application/xhtml+xml"/>

<item
    id="nav"
    href="nav.xhtml"
    media-type="application/xhtml+xml"
    properties="nav"/>`;


            let spine = `
<itemref idref="introduction"/>`;


            for (let i = 0; i < chapterInfos.length; i++) {

                const id = `chapter_${i + 1}`;

                manifest += `
<item
    id="${id}"
    href="Text/${id}.xhtml"
    media-type="application/xhtml+xml"/>`;

                spine += `
<itemref idref="${id}"/>`;
            }


            return `<?xml version="1.0" encoding="UTF-8"?>

<package
    xmlns="http://www.idpf.org/2007/opf"
    version="3.0"
    unique-identifier="book-id">

    <metadata
        xmlns:dc="http://purl.org/dc/elements/1.1/">

        <dc:identifier id="book-id">
            urn:uuid:${uuid}
        </dc:identifier>

        <dc:title>${title}</dc:title>

        ${
            author
                ? `<dc:creator>${author}</dc:creator>`
                : ""
        }

        <dc:language>vi</dc:language>

    </metadata>

    <manifest>

        ${manifest}

    </manifest>

    <spine>

        ${spine}

    </spine>

</package>`;
        }


        // =========================================================
        // COVER
        // =========================================================

        /**
         * Tạo thông tin cover.
         *
         * Cover được xử lý riêng.
         * Không giữ cover trong Builder.
         */
        createCover(coverData, extension = "jpg") {

            const ext = this.normalizeExtension(
                extension
            );

            return {
                path: `OEBPS/Images/cover.${ext}`,
                data: coverData,
                mediaType: this.getImageMediaType(ext)
            };
        }


        // =========================================================
        // CHAPTER
        // =========================================================

        /**
         * Tạo MỘT chapter.
         *
         * Không lưu chapter vào Builder.
         *
         * @param {Object} chapter
         * @param {Number} chapterIndex
         * @param {Function} getImage
         * @param {Function} onImage
         *
         * getImage(src)
         *     -> trả về image data
         *
         * onImage(image)
         *     -> packager xử lý ngay
         *
         * @returns {Object}
         */
        async createChapter(
            chapter,
            chapterIndex,
            getImage,
            onImage
        ) {

            if (!chapter) {
                throw new Error(
                    "Chapter không tồn tại"
                );
            }

            const html =
                chapter.contentHtml ||
                chapter.content ||
                "";

            const title =
                chapter.title ||
                `Chapter ${chapterIndex + 1}`;


            const content =
                await this.processChapterImages(
                    html,
                    chapterIndex,
                    getImage,
                    onImage
                );


            const path =
                `OEBPS/Text/chapter_${chapterIndex + 1}.xhtml`;


            return {
                path: path,
                data: this.writeChapter(
                    title,
                    content
                )
            };
        }


        /**
         * Xử lý ảnh trong MỘT chapter.
         *
         * Không tạo:
         *
         * images: []
         *
         * thay vào đó gặp ảnh nào thì
         * gọi onImage() ngay.
         */
        async processChapterImages(
            content,
            chapterIndex,
            getImage,
            onImage
        ) {

            if (!content) {
                return "";
            }


            const regex =
                /<img\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>/gi;


            let output = "";
            let lastIndex = 0;

            let match;


            while (
                (match = regex.exec(content)) !== null
            ) {

                const before =
                    content.substring(
                        lastIndex,
                        match.index
                    );


                output += before;


                const fullTag = match[0];

                const src = match[2];


                let newSrc = src;


                // -------------------------------------------------
                // DATA IMAGE
                // -------------------------------------------------

                if (
                    src.startsWith(
                        "data:image/"
                    )
                ) {

                    const image =
                        this.createDataImage(
                            src,
                            chapterIndex
                        );


                    if (image) {

                        await onImage(image);

                        newSrc =
                            `../Images/${image.name}`;
                    }
                }

                // -------------------------------------------------
                // EXTERNAL / DATABASE IMAGE
                // -------------------------------------------------

                else {

                    let imageData = null;


                    if (
                        typeof getImage ===
                        "function"
                    ) {

                        imageData =
                            await getImage(src);
                    }


                    if (imageData) {

                        const extension =
                            this.getImageExtension(
                                src
                            );


                        const name =
                            `image_${++this.imageCounter}.${extension}`;


                        const image = {

                            name: name,

                            path:
                                `OEBPS/Images/${name}`,

                            data:
                                imageData,

                            mediaType:
                                this.getImageMediaType(
                                    extension
                                )
                        };


                        await onImage(image);


                        newSrc =
                            `../Images/${name}`;
                    }
                }


                // -------------------------------------------------
                // THAY SRC
                // -------------------------------------------------

                const newTag =
                    fullTag.replace(
                        src,
                        newSrc
                    );


                output += newTag;


                lastIndex =
                    regex.lastIndex;
            }


            output +=
                content.substring(
                    lastIndex
                );


            return output;
        }


        /**
         * Tạo image object từ data:image/...
         */
        createDataImage(
            dataUrl,
            chapterIndex
        ) {

            const match =
                dataUrl.match(
                    /^data:image\/([^;,]+)(?:;[^,]*)?,(.*)$/is
                );


            if (!match) {
                return null;
            }


            const extension =
                this.normalizeExtension(
                    match[1]
                );


            const base64 =
                match[2];


            const data =
                this.base64ToUint8Array(
                    base64
                );


            const name =
                `image_${++this.imageCounter}.${extension}`;


            return {

                name: name,

                path:
                    `OEBPS/Images/${name}`,

                data: data,

                mediaType:
                    this.getImageMediaType(
                        extension
                    )
            };
        }


        /**
         * Tạo XHTML cho chapter.
         */
        writeChapter(
            title,
            content
        ) {

            title =
                this.escapeXml(
                    title || ""
                );


            return `<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE html>

<html
    xmlns="http://www.w3.org/1999/xhtml">

<head>

    <title>${title}</title>

    <link
        rel="stylesheet"
        type="text/css"
        href="../Styles/style.css"/>

</head>

<body>

    <h1>${title}</h1>

    <div class="chapter">

        ${content}

    </div>

</body>

</html>`;
        }


        // =========================================================
        // IMAGE
        // =========================================================

        getImageExtension(src) {

            if (!src) {
                return "jpg";
            }


            let value = src
                .split("?")[0]
                .split("#")[0];


            const match =
                value.match(
                    /\.([a-zA-Z0-9]+)$/
                );


            if (!match) {
                return "jpg";
            }


            return this.normalizeExtension(
                match[1]
            );
        }


        normalizeExtension(extension) {

            extension =
                String(extension || "")
                    .toLowerCase()
                    .replace(
                        /^\./,
                        ""
                    );


            if (
                extension === "jpeg"
            ) {
                return "jpg";
            }


            if (
                extension === "svg+xml"
            ) {
                return "svg";
            }


            if (
                !extension
            ) {
                return "jpg";
            }


            return extension;
        }


        getImageMediaType(extension) {

            extension =
                this.normalizeExtension(
                    extension
                );


            switch (extension) {

                case "jpg":
                    return "image/jpeg";

                case "png":
                    return "image/png";

                case "gif":
                    return "image/gif";

                case "webp":
                    return "image/webp";

                case "svg":
                    return "image/svg+xml";

                case "bmp":
                    return "image/bmp";

                default:
                    return "application/octet-stream";
            }
        }


        // =========================================================
        // BASE64
        // =========================================================

        base64ToUint8Array(base64) {

            const binary =
                atob(base64);

            const bytes =
                new Uint8Array(
                    binary.length
                );


            for (
                let i = 0;
                i < binary.length;
                i++
            ) {

                bytes[i] =
                    binary.charCodeAt(i);
            }


            return bytes;
        }


        uint8ArrayToBase64(bytes) {

            let binary = "";

            const chunkSize = 0x8000;


            for (
                let i = 0;
                i < bytes.length;
                i += chunkSize
            ) {

                binary += String.fromCharCode(
                    ...bytes.subarray(
                        i,
                        Math.min(
                            i + chunkSize,
                            bytes.length
                        )
                    )
                );
            }


            return btoa(binary);
        }


        // =========================================================
        // UTILITY
        // =========================================================

        escapeXml(value) {

            return String(value ?? "")
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&apos;"
                );
        }


        uuid() {

            if (
                typeof crypto !== "undefined" &&
                crypto.randomUUID
            ) {

                return crypto.randomUUID();
            }


            return (
                "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            ).replace(
                /[xy]/g,
                function (c) {

                    const r =
                        Math.random() * 16 | 0;

                    const v =
                        c === "x"
                            ? r
                            : (r & 0x3 | 0x8);

                    return v.toString(16);
                }
            );
        }
    }


    // =============================================================
    // WEBVIEW EXPORT
    // =============================================================

    window.EpubBuilder = EpubBuilder;

})();
