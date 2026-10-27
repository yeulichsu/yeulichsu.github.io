/* ===========================================================
   Dòng Thời Gian Lịch Sử Việt Nam — khởi tạo TimelineJS
   - Nạp data/history.json (+ sự kiện người dùng trong localStorage).
   - Chuyển sang định dạng TimelineJS (start_date / text / media).
   - Khởi tạo TL.Timeline với ngôn ngữ tiếng Việt (assets/js/vi.json).
   =========================================================== */
(function () {
  "use strict";

  var LS_KEY = "lsvn_events_v1"; // sự kiện người dùng tự thêm (trang quản lý)

  // ---------- Tiện ích ----------
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function loadUserEvents() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  // Dựng phần "text" cho một sự kiện: tóm tắt + danh sách bài báo.
  function buildText(ev) {
    var html = "";
    if (ev.summary) html += "<p>" + escapeHtml(ev.summary) + "</p>";

    var tags = Array.isArray(ev.tags) ? ev.tags : [];
    if (tags.length) {
      html += '<p class="tl-tags">' +
        tags.map(function (t) { return "#" + escapeHtml(t); }).join(" ") + "</p>";
    }

    var articles = Array.isArray(ev.articles)
      ? ev.articles.filter(function (a) { return a && a.url; }) : [];
    if (articles.length) {
      html += '<p class="tl-articles-label">Bài báo liên quan:</p><ul class="tl-articles">';
      articles.forEach(function (a) {
        var title = a.title || a.url;
        html += '<li><a href="' + escapeHtml(a.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(title) + "</a></li>";
      });
      html += "</ul>";
    }
    return html;
  }

  // Chuyển một sự kiện của ta sang slide TimelineJS.
  function toSlide(ev) {
    var slide = {
      start_date: {
        year: ev.year != null ? Number(ev.year) : 0
      },
      text: {
        headline: escapeHtml(ev.title || "(Chưa đặt tên)"),
        text: buildText(ev)
      }
    };
    if (ev.month) slide.start_date.month = Number(ev.month);
    if (ev.day) slide.start_date.day = Number(ev.day);

    // Nhóm hiển thị theo thời kỳ (TimelineJS vẽ nhãn nhóm ở dải điều hướng dưới)
    if (ev.era) slide.group = ev.era;

    // Ảnh (nếu có) làm media của slide; nếu không, dùng bài báo đầu tiên làm media
    var articles = Array.isArray(ev.articles)
      ? ev.articles.filter(function (a) { return a && a.url; }) : [];
    if (ev.image) {
      slide.media = { url: ev.image, caption: ev.title || "" };
    } else if (articles.length) {
      slide.media = {
        url: articles[0].url,
        caption: articles[0].title || articles[0].url,
        link: articles[0].url,
        link_target: "_blank"
      };
    }
    return slide;
  }

  function buildTimelineData(events) {
    return {
      title: {
        text: {
          headline: "Dòng Thời Gian Lịch Sử Việt Nam",
          text: "<p>Các sự kiện quan trọng trong lịch sử Việt Nam, kèm bài báo và nguồn liên quan. " +
            "Kéo thanh bên dưới hoặc dùng mũi tên để di chuyển qua các mốc thời gian.</p>"
        }
      },
      events: events.map(toSlide)
    };
  }

  function showError(msg) {
    var el = document.getElementById("load-error");
    if (el) { el.textContent = msg; el.hidden = false; }
  }

  function init(events) {
    if (typeof TL === "undefined" || !TL.Timeline) {
      showError("Không tải được thư viện TimelineJS (kiểm tra kết nối mạng tới cdn.knightlab.com).");
      return;
    }
    var data = buildTimelineData(events);
    var options = {
      language: "assets/js/vi.json", // Việt hóa nhãn giao diện
      start_at_end: false,           // mở ở sự kiện sớm nhất
      initial_zoom: 2,               // mức zoom khởi đầu (có thể phóng to/thu nhỏ)
      timenav_position: "bottom",
      timenav_height_percentage: 30, // thanh thời gian dưới cao hơn, dễ thấy nhiều mốc
      duration: 600,
      // Bật zoom: nút +/- ở góc thanh thời gian, cuộn chuột, và các nấc zoom.
      // zoom_sequence là dãy hệ số scale cho mỗi nấc (càng nhỏ càng thu xa).
      zoom_sequence: [0.2, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    };
    try {
      /* eslint-disable no-new */
      new TL.Timeline("timeline-embed", data, options);
    } catch (e) {
      showError("Lỗi khởi tạo dòng thời gian: " + e.message);
    }
  }

  // ---------- Nạp dữ liệu ----------
  function boot() {
    fetch("data/history.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var base = Array.isArray(data) ? data : (data.events || []);
        var all = base.concat(loadUserEvents());
        if (!all.length) { showError("Chưa có sự kiện nào trong data/history.json."); return; }
        init(all);
      })
      .catch(function (err) {
        var user = loadUserEvents();
        if (user.length) { init(user); return; }
        showError("Không tải được dữ liệu (" + err.message +
          "). Hãy chạy qua một web server tĩnh, ví dụ: python -m http.server");
      });
  }

  var yEl = document.getElementById("footer-year");
  if (yEl) yEl.textContent = new Date().getFullYear();

  boot();
})();
