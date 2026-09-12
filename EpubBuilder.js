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
                ,
                {
                    path: "OEBPS/Text/toc.xhtml",
                    data: this.createToc(book,chapterInfos)
                }
                ,
                {
                    path: "OEBPS/nav.xhtml",
                    data: this.createNav(book,chapterInfos)
                }
                ,
                {
                    path: "OEBPS/content.opf",
                    data: this.createContentOpf(book,chapterInfos)
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


        createStyle()      
{

        return `
        body { font-family: sans-serif; line-height: 1.6; padding: 1em; }

        h1 { text-align: center; }

        p { margin: 0.5em 0; text-align: justify; }
        `.trim();
}



createIntroduction(book) 
{

    // =========================================================
    // BOOK INFO
    // =========================================================

    const title =
        this.escapeXml(
            book && book.tname
                ? book.tname
                : ""
        );

    const author =
        this.escapeXml(
            book && book.hauthor
                ? book.hauthor
                : ""
        );

    const category =
        this.escapeXml(
            book && book.category
                ? book.category.trim()
                : ""
        );


    // =========================================================
    // DESCRIPTION
    // =========================================================

    const info =
        book && book.info
            ? String(book.info)
            : "";


    const infoHtml =
        this.escapeXml(info)
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




        // =========================================================
        // TOC
        // =========================================================

createToc(book, chapterInfos = []) 
{

    const title =
        this.escapeXml(
            book && book.tname
                ? book.tname
                : ""
        );


    const links =
        chapterInfos
            .map(function (chapter, index) {

                const chapterTitle =
                    chapter && chapter.title
                        ? chapter.title
                        : `Chapter ${index + 1}`;

                return `<a href="../Text/chapter_${index + 1}.xhtml">${this.escapeXml(chapterTitle)}</a>
    <br/>`;

                }, this)
                .join("\n");


        return `<?xml version="1.0" encoding="utf-8"?>

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
}



        // =========================================================
        // NAV
        // =========================================================

        createNav(book, chapterInfos = []) 
{
    const title = this.escapeXml(
        book && book.tname ? book.tname : ""
    );

    const chapterItems = chapterInfos
        .map(function (chapter, index) {
            const chapterTitle =
                chapter && chapter.title
                    ? chapter.title
                    : `Chapter ${index + 1}`;

            return `            <li><a href="Text/chapter_${index + 1}.xhtml">${this.escapeXml(chapterTitle)}</a></li>`;
        }, this)
        .join("\n");

    const xml =
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

    return xml;
    };
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
        createContentOpf(book, chapterInfos = []) 
{
    const uuid = this.uuid();

    // Liệt kê các chapter trong manifest
    const manifestItems = chapterInfos
        .map(function (_, index) {
            return `        <item id="chap${index + 1}" href="Text/chapter_${index + 1}.xhtml" media-type="application/xhtml+xml"/>`;
        })
        .join("\n");

    // Thứ tự đọc các chapter
    const spineItems = chapterInfos
        .map(function (_, index) {
            return `        <itemref idref="chap${index + 1}"/>`;
        })
        .join("\n");

    const title = this.escapeXml(
        book && book.tname ? book.tname : ""
    );

    const author = this.escapeXml(
        book && book.hauthor ? book.hauthor : ""
    );

    const description =
        book && book.info != null
            ? `        <dc:description>${this.escapeXml(book.info)}</dc:description>\n`
            : "";

    const opf =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">\n` +
        `    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
        `        <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>\n` +
        `        <dc:title>${title}</dc:title>\n` +
        `        <dc:creator>${author}</dc:creator>\n` +
        `        <meta name="cover" content="cover"/>\n` +
        `        <dc:language>vi</dc:language>\n` +
        description +
        `    </metadata>\n` +
        `    <manifest>\n` +
        `        <item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>\n` +
        `        <item id="style" href="Styles/style.css" media-type="text/css"/>\n` +
        `        <item id="intro" href="Text/introduction.xhtml" media-type="application/xhtml+xml"/>\n` +
        `        <item id="cover" href="Images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>\n` +
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

    return  opf;
    };
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


