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


        // =========================================================
        // BASE FILES
        // =========================================================

        createBaseFiles(book, chapterInfos = []) {

            this.reset();

            return [
                {
                    path: "mimetype",
                    data: this.createMimetype()
                },
                {
                    path: "META-INF/container.xml",
                    data: this.createContainerXml()
                },
                {
                    path: "OEBPS/Styles/style.css",
                    data: this.createStyle()
                },
                {
                    path: "OEBPS/Text/introduction.xhtml",
                    data: this.createIntroduction(book)
                }
            ];
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
body {
    margin: 0;
    padding: 0;
    line-height: 1.6;
    font-family: sans-serif;
}

h1,
h2,
h3 {
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


        createIntroduction(book) {

            const title = this.escapeXml(
                this.getBookTitle(book)
            );

            const author = this.escapeXml(
                this.getBookAuthor(book)
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

    ${
        author
            ? `<p class="center">${author}</p>`
            : ""
    }

</body>

</html>`;
        }


        // =========================================================
        // TOC
        // =========================================================

        createToc(book, chapterInfos = []) {

            const title = this.escapeXml(
                this.getBookTitle(book) ||
                "Table of Contents"
            );

            let items = "";

            for (let i = 0; i < chapterInfos.length; i++) {

                const chapter = chapterInfos[i] || {};

                const chapterTitle = this.escapeXml(
                    chapter.title ||
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

<ol>
${items}
</ol>

</body>

</html>`;
        }


        // =========================================================
        // NAV
        // =========================================================

        createNav(book, chapterInfos = []) {

            const title = this.escapeXml(
                this.getBookTitle(book) ||
                "Navigation"
            );

            let items = "";

            for (let i = 0; i < chapterInfos.length; i++) {

                const chapter = chapterInfos[i] || {};

                const chapterTitle = this.escapeXml(
                    chapter.title ||
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

<nav
    epub:type="toc"
    id="toc">

    <h1>${title}</h1>

    <ol>
        ${items}
    </ol>

</nav>

</body>

</html>`;
        }


        // =========================================================
        // CONTENT OPF
        // =========================================================

        /**
         * Tạo content.opf.
         *
         * chapterInfos chỉ cần:
         *
         * [
         *     {
         *         title: "...",
         *         path: "OEBPS/Text/chapter_1.xhtml"
         *     }
         * ]
         *
         * images:
         *
         * [
         *     {
         *         name: "image_1.jpg",
         *         path: "OEBPS/Images/image_1.jpg",
         *         mediaType: "image/jpeg"
         *     }
         * ]
         */
        createContentOpf(
            book,
            chapterInfos = [],
            images = [],
            cover = null
        ) {

            const title = this.escapeXml(
                this.getBookTitle(book) ||
                "Book"
            );

            const author = this.escapeXml(
                this.getBookAuthor(book)
            );

            const uuid = this.uuid();


            // -----------------------------------------------------
            // MANIFEST
            // -----------------------------------------------------

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


            // -----------------------------------------------------
            // COVER
            // -----------------------------------------------------

            if (cover) {

                manifest += `
<item
    id="cover-image"
    href="Images/${this.escapeXml(
        cover.name || "cover.jpg"
    )}"
    media-type="${this.escapeXml(
        cover.mediaType || "image/jpeg"
    )}"
    properties="cover-image"/>`;
            }


            // -----------------------------------------------------
            // IMAGES
            // -----------------------------------------------------

            for (let i = 0; i < images.length; i++) {

                const image = images[i];

                if (!image) {
                    continue;
                }

                const name =
                    image.name ||
                    `image_${i + 1}.jpg`;

                const mediaType =
                    image.mediaType ||
                    "application/octet-stream";

                manifest += `
<item
    id="image_${i + 1}"
    href="Images/${this.escapeXml(name)}"
    media-type="${this.escapeXml(mediaType)}"/>`;
            }


            // -----------------------------------------------------
            // CHAPTERS
            // -----------------------------------------------------

            let spine = `
<itemref idref="introduction"/>`;

            for (let i = 0; i < chapterInfos.length; i++) {

                const chapter = chapterInfos[i] || {};

                const id =
                    chapter.id ||
                    `chapter_${i + 1}`;

                const path =
                    chapter.path ||
                    `OEBPS/Text/${id}.xhtml`;

                const href =
                    path.indexOf("OEBPS/") === 0
                        ? path.substring(6)
                        : path;

                manifest += `
<item
    id="${this.escapeXml(id)}"
    href="${this.escapeXml(href)}"
    media-type="application/xhtml+xml"/>`;

                spine += `
<itemref
    idref="${this.escapeXml(id)}"/>`;
            }


            // -----------------------------------------------------
            // RESULT
            // -----------------------------------------------------

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

        createCover(
            coverData,
            extension = "jpg"
        ) {

            const ext =
                this.normalizeExtension(
                    extension
                );

            return {

                name:
                    `cover.${ext}`,

                path:
                    `OEBPS/Images/cover.${ext}`,

                data:
                    coverData,

                extension:
                    ext,

                mediaType:
                    this.getImageMediaType(
                        ext
                    )
            };
        }


        // =========================================================
        // CHAPTER
        // =========================================================

        /**
         * Tạo một chapter.
         *
         * getImage(src)
         *     -> trả image data
         *
         * onImage(image)
         *     -> Builder gửi image ra ngoài ngay lập tức
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

                id:
                    `chapter_${chapterIndex + 1}`,

                path:
                    path,

                title:
                    title,

                data:
                    this.writeChapter(
                        title,
                        content
                    )
            };
        }


        // =========================================================
        // PROCESS IMAGE
        // =========================================================

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

                output +=
                    content.substring(
                        lastIndex,
                        match.index
                    );


                const fullTag =
                    match[0];

                const src =
                    match[2];


                let newSrc =
                    src;


                // -------------------------------------------------
                // DATA IMAGE
                // -------------------------------------------------

                if (
                    src.toLowerCase()
                        .indexOf("data:image/") === 0
                ) {

                    const image =
                        this.createDataImage(
                            src
                        );


                    if (image) {

                        if (
                            typeof onImage ===
                            "function"
                        ) {

                            await onImage(
                                image
                            );
                        }


                        newSrc =
                            `../Images/${image.name}`;
                    }
                }


                // -------------------------------------------------
                // EXTERNAL IMAGE
                // -------------------------------------------------

                else {

                    let imageData =
                        null;


                    if (
                        typeof getImage ===
                        "function"
                    ) {

                        imageData =
                            await getImage(
                                src
                            );
                    }


                    if (imageData) {

                        const extension =
                            this.getImageExtension(
                                src
                            );


                        const name =
                            `image_${++this.imageCounter}.${extension}`;


                        const image = {

                            name:
                                name,

                            path:
                                `OEBPS/Images/${name}`,

                            data:
                                imageData,

                            extension:
                                extension,

                            mediaType:
                                this.getImageMediaType(
                                    extension
                                )
                        };


                        if (
                            typeof onImage ===
                            "function"
                        ) {

                            await onImage(
                                image
                            );
                        }


                        newSrc =
                            `../Images/${name}`;
                    }
                }


                // -------------------------------------------------
                // REPLACE SRC
                // -------------------------------------------------

                const newTag =
                    fullTag.replace(
                        src,
                        newSrc
                    );


                output +=
                    newTag;


                lastIndex =
                    regex.lastIndex;
            }


            output +=
                content.substring(
                    lastIndex
                );


            return output;
        }


        // =========================================================
        // DATA IMAGE
        // =========================================================

        createDataImage(dataUrl) {

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


            let data;


            if (
                dataUrl
                    .toLowerCase()
                    .indexOf(";base64,") >= 0
            ) {

                data =
                    this.base64ToUint8Array(
                        match[2]
                    );
            }
            else {

                const text =
                    decodeURIComponent(
                        match[2]
                    );

                data =
                    new TextEncoder()
                        .encode(text);
            }


            const name =
                `image_${++this.imageCounter}.${extension}`;


            return {

                name:
                    name,

                path:
                    `OEBPS/Images/${name}`,

                data:
                    data,

                extension:
                    extension,

                mediaType:
                    this.getImageMediaType(
                        extension
                    )
            };
        }


        // =========================================================
        // WRITE CHAPTER
        // =========================================================

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
        // BOOK INFO
        // =========================================================

        getBookTitle(book) {

            if (!book) {
                return "";
            }

            return (
                book.title ||
                book.name ||
                book.tname ||
                book.hname ||
                ""
            );
        }


        getBookAuthor(book) {

            if (!book) {
                return "";
            }

            return (
                book.author ||
                ""
            );
        }


        // =========================================================
        // IMAGE UTILITY
        // =========================================================

        getImageExtension(src) {

            if (!src) {
                return "jpg";
            }


            let value =
                String(src)
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


            if (extension === "jpeg") {
                return "jpg";
            }


            if (extension === "svg+xml") {
                return "svg";
            }


            if (!extension) {
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

            const chunkSize =
                0x8000;


            for (
                let i = 0;
                i < bytes.length;
                i += chunkSize
            ) {

                binary +=
                    String.fromCharCode.apply(
                        null,
                        bytes.subarray(
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
        // XML
        // =========================================================

        escapeXml(value) {

            return String(value || "")
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


        // =========================================================
        // UUID
        // =========================================================

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
    // EXPORT
    // =============================================================

    window.EpubBuilder =
        EpubBuilder;

})();


