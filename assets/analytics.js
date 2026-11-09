/*
 * Thống kê cho yeulichsu.github.io
 * - GA4 (G-MW2VZ1JW4T) nạp trực tiếp bằng gtag.js -> KHÔNG tạo thêm tag GA4 trong GTM (sẽ bị đếm 2 lần).
 * - GTM (GTM-NZS9MPS2) vẫn được nạp để xác minh Search Console / dùng về sau.
 */
(function () {
    var GA_ID = 'G-MW2VZ1JW4T';
    var GTM_ID = 'GTM-NZS9MPS2';

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    // Không đo khi chạy localhost hoặc mở file trực tiếp
    if (/^(localhost|127\.0\.0\.1|)$/.test(location.hostname)) return;

    function loadScript(src) {
        var s = document.createElement('script');
        s.async = true;
        s.src = src;
        document.head.appendChild(s);
    }

    // GA4 (tự gửi page_view; click link ra ngoài do Enhanced Measurement đo)
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    gtag('js', new Date());
    gtag('config', GA_ID);

    // GTM
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    loadScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID);

    // Đo nút bấm (chỉ nhãn nút, không thu nội dung người dùng nhập)
    document.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest('button');
        if (!el) return;
        var label = (el.getAttribute('aria-label') || el.title || el.textContent || '').trim().slice(0, 40);
        if (label) gtag('event', 'button_click', { action_label: label, page_path: location.pathname });
    });
})();
