if (location.href.includes("/app.v2.php")) {
    app.net.networkManagerXHR.defaultDomains =
        app.net.networkManagerXHR.defaultDomains.filter(
            x => x !== "https://sangtacviet.com"
        );
}
