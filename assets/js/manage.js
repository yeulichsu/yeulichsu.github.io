/* ===========================================================
   Trang quản lý sự kiện — thêm/sửa/xóa, xuất/nhập JSON.
   Lưu trong localStorage dưới cùng khóa với trang chính.
   =========================================================== */
(function () {
  "use strict";

  var LS_KEY = "lsvn_events_v1";

  var form = document.getElementById("event-form");
  var els = {
    id: document.getElementById("f-id"),
    year: document.getElementById("f-year"),
    month: document.getElementById("f-month"),
    day: document.getElementById("f-day"),
    title: document.getElementById("f-title"),
    era: document.getElementById("f-era"),
    summary: document.getElementById("f-summary"),
    image: document.getElementById("f-image"),
    tags: document.getElementById("f-tags"),
    articles: document.getElementById("articles-list"),
    addArticle: document.getElementById("add-article"),
    formTitle: document.getElementById("form-title"),
    resetBtn: document.getElementById("reset-form"),
    myList: document.getElementById("my-list"),
    myEmpty: document.getElementById("my-empty"),
    myCount: document.getElementById("my-count"),
    eraList: document.getElementById("era-list"),
    exportBtn: document.getElementById("export-json"),
    importBtn: document.getElementById("import-json"),
    clearBtn: document.getElementById("clear-mine"),
    toast: document.getElementById("toast")
  };

  // ---------- Lưu trữ ----------
  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function save(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { els.toast.hidden = true; }, 2200);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtDate(ev) {
    var y = Number(ev.year);
    var yt = y < 0 ? (Math.abs(y) + " TCN") : ("" + y);
    var bits = [];
    if (ev.day) bits.push(ev.day);
    if (ev.month) bits.push("tháng " + ev.month);
    bits.push(yt);
    return bits.join("/").replace("/tháng", ", tháng").replace("tháng", "th.");
  }

  // ---------- Hàng bài báo ----------
  function articleRow(title, url) {
    var div = document.createElement("div");
    div.className = "article-row";
    div.innerHTML =
      '<input class="a-title" type="text" placeholder="Tiêu đề bài báo" />' +
      '<input class="a-url" type="url" placeholder="https://..." />' +
      '<button type="button" class="a-del" title="Xóa">✕</button>';
    div.querySelector(".a-title").value = title || "";
    div.querySelector(".a-url").value = url || "";
    div.querySelector(".a-del").addEventListener("click", function () { div.remove(); });
    return div;
  }
  function addArticleRow(title, url) { els.articles.appendChild(articleRow(title, url)); }
  function collectArticles() {
    var out = [];
    els.articles.querySelectorAll(".article-row").forEach(function (row) {
      var url = row.querySelector(".a-url").value.trim();
      if (!url) return;
      var t = row.querySelector(".a-title").value.trim();
      out.push({ title: t || url, url: url });
    });
    return out;
  }

  // ---------- Form ----------
  function resetForm() {
    form.reset();
    els.id.value = "";
    els.articles.innerHTML = "";
    els.formTitle.textContent = "Thêm sự kiện mới";
  }

  function fillForm(ev) {
    els.id.value = ev.id || "";
    els.year.value = ev.year != null ? ev.year : "";
    els.month.value = ev.month != null ? ev.month : "";
    els.day.value = ev.day != null ? ev.day : "";
    els.title.value = ev.title || "";
    els.era.value = ev.era || "";
    els.summary.value = ev.summary || "";
    els.image.value = ev.image || "";
    els.tags.value = (ev.tags || []).join(", ");
    els.articles.innerHTML = "";
    (ev.articles || []).forEach(function (a) { addArticleRow(a.title, a.url); });
    els.formTitle.textContent = "Sửa sự kiện";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var year = els.year.value.trim();
    var title = els.title.value.trim();
    if (year === "" || !title) { toast("Cần nhập Năm và Tiêu đề."); return; }

    var tags = els.tags.value.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    var ev = {
      id: els.id.value || ("u_" + Date.now().toString(36)),
      year: Number(year),
      month: els.month.value ? Number(els.month.value) : null,
      day: els.day.value ? Number(els.day.value) : null,
      title: title,
      era: els.era.value.trim() || "Khác",
      summary: els.summary.value.trim(),
      image: els.image.value.trim(),
      tags: tags,
      articles: collectArticles()
    };

    var list = load();
    var idx = list.findIndex(function (x) { return x.id === ev.id; });
    if (idx >= 0) { list[idx] = ev; toast("Đã cập nhật sự kiện."); }
    else { list.push(ev); toast("Đã thêm sự kiện."); }
    save(list);
    resetForm();
    renderList();
  });

  els.addArticle.addEventListener("click", function () { addArticleRow(); });
  els.resetBtn.addEventListener("click", resetForm);

  // ---------- Danh sách ----------
  function renderList() {
    var list = load().slice().sort(function (a, b) {
      return (Number(b.year) || 0) - (Number(a.year) || 0);
    });
    els.myCount.textContent = list.length;
    els.myEmpty.hidden = list.length > 0;
    els.myList.innerHTML = "";

    // Gợi ý thời kỳ (datalist)
    var eras = {};
    load().forEach(function (e) { if (e.era) eras[e.era] = 1; });
    ["Dựng nước", "Bắc thuộc & đấu tranh giành độc lập", "Các triều đại phong kiến",
     "Pháp thuộc", "Đấu tranh giành độc lập hiện đại", "Thống nhất & đổi mới"]
      .forEach(function (e) { eras[e] = 1; });
    els.eraList.innerHTML = Object.keys(eras)
      .map(function (e) { return '<option value="' + escapeHtml(e) + '">'; }).join("");

    list.forEach(function (ev) {
      var li = document.createElement("li");
      li.innerHTML =
        '<div class="mi-main">' +
          '<div class="mi-date">' + escapeHtml(fmtDate(ev)) + " · " + escapeHtml(ev.era || "Khác") + "</div>" +
          '<div class="mi-title">' + escapeHtml(ev.title) + "</div>" +
        "</div>" +
        '<div class="mi-actions">' +
          '<button class="edit">Sửa</button>' +
          '<button class="del">Xóa</button>' +
        "</div>";
      li.querySelector(".edit").addEventListener("click", function () { fillForm(ev); });
      li.querySelector(".del").addEventListener("click", function () {
        if (!confirm('Xóa sự kiện "' + ev.title + '"?')) return;
        save(load().filter(function (x) { return x.id !== ev.id; }));
        renderList();
        toast("Đã xóa.");
      });
      els.myList.appendChild(li);
    });
  }

  // ---------- Xuất / Nhập ----------
  els.exportBtn.addEventListener("click", function () {
    var list = load();
    if (!list.length) { toast("Chưa có sự kiện để xuất."); return; }
    var blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "su-kien-cua-toi.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Đã xuất JSON. Dán vào data/history.json để công khai.");
  });

  els.importBtn.addEventListener("click", function () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", function () {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var arr = Array.isArray(data) ? data : (data.events || []);
          if (!Array.isArray(arr)) throw new Error("Định dạng không hợp lệ");
          var list = load();
          arr.forEach(function (ev) {
            if (!ev.id) ev.id = "u_" + Math.random().toString(36).slice(2);
            var idx = list.findIndex(function (x) { return x.id === ev.id; });
            if (idx >= 0) list[idx] = ev; else list.push(ev);
          });
          save(list);
          renderList();
          toast("Đã nhập " + arr.length + " sự kiện.");
        } catch (e) { toast("Tệp JSON không hợp lệ."); }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  els.clearBtn.addEventListener("click", function () {
    if (!load().length) { toast("Không có gì để xóa."); return; }
    if (!confirm("Xóa TẤT CẢ sự kiện bạn đã thêm? Không thể hoàn tác.")) return;
    save([]);
    renderList();
    toast("Đã xóa hết.");
  });

  renderList();
})();
