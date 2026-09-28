/* Nonlinear student auth helpers — API under /nonlinear/api/ */
(function (global) {
  var API = "/nonlinear/api";

  function jsonFetch(url, opts) {
    opts = opts || {};
    opts.credentials = "same-origin";
    opts.headers = Object.assign(
      { "Content-Type": "application/json" },
      opts.headers || {}
    );
    return fetch(url, opts).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = JSON.parse(t); } catch (e) {}
        return { ok: r.ok, status: r.status, json: j || {}, text: t };
      });
    });
  }

  function me() {
    return jsonFetch(API + "/me").then(function (r) {
      return r.ok ? (r.json.user || null) : null;
    });
  }
  function register(fields) {
    return jsonFetch(API + "/register", { method: "POST", body: JSON.stringify(fields) });
  }
  function login(student_id, password) {
    return jsonFetch(API + "/login", {
      method: "POST",
      body: JSON.stringify({ student_id: student_id, password: password }),
    });
  }
  function logout() {
    return jsonFetch(API + "/logout", { method: "POST", body: "{}" });
  }
  function homeworkList() {
    return jsonFetch(API + "/homework").then(function (r) {
      return (r.json && r.json.homework) || [];
    });
  }
  function posts(id) {
    return jsonFetch(API + "/homework/" + encodeURIComponent(id) + "/posts").then(function (r) {
      return (r.json && r.json.posts) || [];
    });
  }
  function submitPost(id, content) {
    return jsonFetch(API + "/homework/" + encodeURIComponent(id) + "/posts", {
      method: "POST",
      body: JSON.stringify({ content: content }),
    });
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function mountHeader(sel) {
    var slot = document.querySelector(sel || "#nl-auth-slot");
    if (!slot) return Promise.resolve(null);
    return me().then(function (user) {
      if (!user) {
        slot.innerHTML =
          '<a class="nl-btn nl-btn-ghost" href="/nonlinear/register.html">注册</a>' +
          '<a class="nl-btn nl-btn-primary" href="/nonlinear/login.html">登录</a>' +
          '<a class="nl-btn nl-btn-ghost" href="/nonlinear/homework.html">作业</a>';
        return null;
      }
      slot.innerHTML =
        '<span class="nl-user">你好，' + escapeHtml(user.name) + "</span>" +
        '<a class="nl-btn nl-btn-ghost" href="/nonlinear/homework.html">作业</a>' +
        '<button type="button" class="nl-btn nl-btn-ghost" id="nl-logout">退出</button>';
      var btn = document.getElementById("nl-logout");
      if (btn) btn.addEventListener("click", function () {
        logout().then(function () { location.href = "/nonlinear/login.html"; });
      });
      return user;
    });
  }

  global.NlAuth = {
    me: me, register: register, login: login, logout: logout,
    homeworkList: homeworkList, posts: posts, submitPost: submitPost,
    mountHeader: mountHeader, escapeHtml: escapeHtml,
  };
})(window);
