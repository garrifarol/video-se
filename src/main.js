document.addEventListener("load", () => {
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    scrollTop();
});

// ===================Scroll Top==========================

const scrollTop = () => {
    window.scrollTo(0, 0);
};

// ==================Prevent Double Clicks =========================

let lastClickElement = null;
let lastClickTime = Date.now();
document.addEventListener(
    "click",
    (e) => {
        const { target } = e;
        const now = Date.now();
        if (target === lastClickElement && now - lastClickTime < 2000) {
            e.preventDefault();
            e.stopPropagation();
        }
        lastClickElement = target;
        lastClickTime = now;
    },
    true
);

// ============================Number Formatter======================
const formatNumberToEn = (number) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
};

// ======================Construct li el ==============================

const buildLiEl = (classes) => {
    const li = document.createElement("li");
    if (classes) li.setAttribute("class", classes);
    return li;
};

// =====================Construct img el=========================

const buildImgEl = (src, alt, classes) => {
    const img = document.createElement("img");
    img.setAttribute("src", src);
    if (alt) img.setAttribute("alt", alt);
    if (classes) img.setAttribute("class", classes);
    return img;
};

// =====================Construct box icon el=========================

const buildBoxIconEl = (classes) => {
    const i = document.createElement("i");
    i.setAttribute("class", classes);
    return i;
};

// ====================Construct div el============================

const buildDivEl = (classes) => {
    const div = document.createElement("div");
    if (classes) div.setAttribute("class", classes);
    return div;
};

// ===================Construct header=============================

const buildHeaderEl = (headerNum, text, classes) => {
    const header = document.createElement(`h${headerNum}`);
    header.innerHTML = text;
    // const text_ = document.createTextNode(text);
    // header.appendChild(text_);
    if (classes) header.setAttribute("class", classes);
    return header;
};

// ===================Construct paragraph=============================

const buildParagraphEl = (text, classes) => {
    const p = document.createElement("p");
    const text_ = document.createTextNode(text);
    p.appendChild(text_);
    if (classes) p.setAttribute("class", classes);
    return p;
};

// ===================Construct anchor tag=============================

const buildAnchorEl = (href, title, text, classes) => {
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.setAttribute("title", title);
    if (text) {
        const text_ = document.createTextNode(text);
        a.appendChild(text_);
    }
    if (classes) a.setAttribute("class", classes);
    return a;
};

// =====================Construct result cards========================

const buildResultCard = (
    imgSrc,
    altImg,
    title,
    artist,
    url,
    embedUrl,
    views
) => {
    const li = buildLiEl();
    const img = buildImgEl(imgSrc, altImg);
    const resultContent = buildDivEl("result-content");
    const resultDetail = buildDivEl("result-detail");
    const title_ = buildHeaderEl("4", title);
    const artist_ = buildParagraphEl(artist, "artist");
    const videoDetail = buildDivEl("video-detail");
    const websiteDetail = buildDivEl("website-detail");
    const youtubeLogo = buildBoxIconEl("bx bxl-youtube");
    const url_ = buildParagraphEl("Youtube.com", "website-url");
    const views_ = buildParagraphEl(views, "views");
    const urlContainer = buildAnchorEl(url, embedUrl);
    urlContainer.style.display = "none";

    websiteDetail.append(youtubeLogo, url_);
    videoDetail.append(websiteDetail, views_);
    resultDetail.append(title_, artist_, videoDetail);
    resultContent.append(img, resultDetail);
    li.append(urlContainer, resultContent);

    return li;
};

// ====================Remove child of resultList ====================

const resultList = document.querySelector("#resultList");
const removeResultList = () => {
    resultList.innerHTML = "";
};

// ====================Query Google=======================

const baseURL = "https://customsearch.googleapis.com/customsearch/v1";
const cx = "60d339a631d344dda";
const apiKey = "AIzaSyC_HajO_V21eEJu1O0e1HuLz1ZQ-x1rGOc";

const getData = async (value, start) => {
    const url = `${baseURL}?fields=queries,items(title,htmlTitle,pagemap,link)&cx=${cx}&exactTerms=Music&q=${value}&siteSearch=https%3A%2F%2Fwww.youtube.com%2F&siteSearchFilter=i&start=${start}&key=${apiKey}`;
    console.log(url);
    try {
        const reponse = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return await reponse.json();
    } catch (err) {}
};
// ====================Handle Request ==============================
const handleRequest = (value, offset) => {
    getData(value.trim(), offset)
        .then((response) => {
            const { items } = response;
            const { previousPage } = response.queries;
            const { nextPage } = response.queries;
            removeResultList();

            if (previousPage && nextPage) {
                page.style.display = "block";
                nav.style.justifyContent = "space-between";
                prev.style.justifyContent = "start";
                next.style.justifyContent = "end";
            } else {
                page.style.display = "none";
                nav.style.justifyContent = "center";
                prev.style.justifyContent = "center";
                next.style.justifyContent = "center";
            }

            if (previousPage) {
                prev.style.display = "inline-flex";
            } else prev.style.display = "none";

            if (nextPage) {
                next.style.display = "inline-flex";
            } else next.style.display = "none";

            if (items) {
                nav.style.display = "flex";

                for (const item of items) {
                    const imgSrc = item.pagemap.imageobject[0].url;
                    const altImg = item.title;
                    const title = item.htmlTitle;
                    const artist = item.pagemap.person[0].name;
                    const url = item.link;
                    const embedUrl = item.pagemap.videoobject[0].embedurl;
                    const views = item.pagemap.videoobject
                        ? formatNumberToEn(
                              item.pagemap.videoobject[0].interactioncount
                          )
                        : "";
                    resultList.appendChild(
                        buildResultCard(
                            imgSrc,
                            altImg,
                            title,
                            artist,
                            url,
                            embedUrl,
                            views
                        )
                    );
                }
            } else {
                const noData = buildParagraphEl(
                    "Search did not match any documents."
                );
                resultList.appendChild(noData);
            }
        })
        .catch(() => {
            removeResultList();
            nav.style.display = "none";

            const errorData = buildParagraphEl(
                "Something went wrong while retrieving search documents."
            );
            resultList.appendChild(errorData);
        });
};

// =====================Submit Form========================

const searchForm = document.querySelector("#searchForm");
const search = document.querySelector("#search");
const prev = document.querySelector("#prev");
const next = document.querySelector("#next");
const page = document.querySelector("#page");
const nav = document.querySelector("#nav");
const LIMIT = 10;
let pageNum = 0;

searchForm.addEventListener("submit", (event) => {
    scrollTop();
    event.preventDefault();
    const { value } = search;
    const searchValue = value.trim();
    if (!searchValue) return;
    handleRequest(value, 1);
    pageNum = 1;
});

// ====================Navigation===========================

next.addEventListener("click", () => {
    scrollTop();
    const { value } = search;
    const searchValue = value.trim();
    if (!searchValue) return;
    handleRequest(value, pageNum * LIMIT + 1);
    pageNum++;
    page.textContent = pageNum;
});

prev.addEventListener("click", () => {
    scrollTop();
    const { value } = search;
    const searchValue = value.trim();
    if (!searchValue) return;
    pageNum--;
    handleRequest(value, pageNum * LIMIT - 10 + 1);
    page.textContent = pageNum;
});

// ==========================Open Preview================================

const preview = document.querySelector("#preview");
const previewContent = document.querySelector(".preview-content");
const iframe = document.querySelector("iframe");
const visitAnchor = document.querySelector("#visit");
let previewResultContent;

resultList.addEventListener("click", (e) => {
    if (e.target.tagName !== "UL" && e.target.tagName !== "LI") {
        previewContent.removeChild(previewContent.lastChild);
        previewResultContent = e.target.closest(".result-content");
        previewResultContent = previewResultContent.cloneNode(true);
        previewResultContent.removeChild(
            previewResultContent.getElementsByTagName("img")[0]
        );
        previewContent.appendChild(previewResultContent);

        const urlContainer = e.target.closest("li").firstChild;
        const url = urlContainer.href;
        const embedUrl = urlContainer.title;
        preview.style.display = "flex";
        iframe.setAttribute("src", embedUrl);
        visitAnchor.setAttribute("href", url);
    }
});

// =======================Close Preview ==============================

const closePreview = document.querySelector("#closePreview");

closePreview.addEventListener("click", () => {
    preview.style.display = "none";
    iframe.removeAttribute("src");
    visitAnchor.removeAttribute("href");
});
