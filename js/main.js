const ITEMS = {
  pre: [
    { id: "pre-1",  title: "ページタイトルの設定",          note: "各ページに適切な title タグがあるか" },
    { id: "pre-2",  title: "メタディスクリプションの設定",   note: "検索結果に表示される説明文" },
    { id: "pre-3",  title: "OGP設定",                        note: "SNSシェア時の画像・タイトル・説明" },
    { id: "pre-4",  title: "favicon の設定",                 note: "ブラウザタブに表示されるアイコン" },
    { id: "pre-5",  title: "レスポンシブデザインの確認",     note: "スマートフォン・タブレットでの表示" },
    { id: "pre-6",  title: "ブラウザ互換性の確認",           note: "Chrome / Safari / Firefox / Edge" },
    { id: "pre-7",  title: "リンク切れチェック",             note: "内部リンク・外部リンクすべて" },
    { id: "pre-8",  title: "画像の alt 属性設定",            note: "アクセシビリティ・SEO対策" },
    { id: "pre-9",  title: "フォームの動作確認",             note: "送信・バリデーション・サンクスページ" },
    { id: "pre-10", title: "SSL証明書の設定",                note: "https:// でアクセスできるか" },
    { id: "pre-11", title: "404ページの設定",                note: "存在しないURLへのアクセス時の表示" },
    { id: "pre-12", title: "アクセス解析の設置",             note: "Google Analytics / Search Console など" },
  ],
  post: [
    { id: "post-1",  title: "本番URLで表示確認",                             note: "すべてのページが正常に表示されるか" },
    { id: "post-2",  title: "フォームの本番動作確認",                        note: "実際にメールが届くか確認" },
    { id: "post-3",  title: "SNSシェアの確認",                               note: "OGP画像・テキストが正しく表示されるか" },
    { id: "post-4",  title: "Google Search Console への登録",                note: "サイトマップの送信も行う" },
    { id: "post-5",  title: "ページ速度の計測",                              note: "PageSpeed Insights でスコア確認" },
    { id: "post-6",  title: "アクセス解析の動作確認",                        note: "セッションが計測されているか" },
    { id: "post-7",  title: "バックアップ体制の確認",                        note: "定期バックアップの設定" },
    { id: "post-8",  title: "公開告知",                                      note: "SNS・メルマガ・関係者への連絡" },
    { id: "post-9",  title: "SiteGuard の有効化",                            note: "管理画面のログイン保護が有効になっているか確認" },
    { id: "post-10", title: "パーマリンク設定の再保存（リニューアル時）",    note: "設定＞パーマリンク設定で何も変更せず保存（リライトルール更新）" },
    { id: "post-11", title: "noindex の解除（テスト環境→本番移行時）",      note: "metaタグやプラグインで noindex が残っていないか確認" },
    { id: "post-12", title: "検索エンジンでの表示設定",                      note: "管理画面＞設定＞表示設定＞「検索エンジンがサイトをインデックスしないようにする」のチェックを外す" },
    { id: "post-13", title: "Basic認証の解除（テスト環境使用時）",           note: "テスト用のアクセス制限が残っていないか確認" },
    { id: "post-14", title: "キャッシュクリアの確認",                        note: "ブラウザ・サーバー・CDNのキャッシュをクリアして最新状態を確認" },
  ],
};

const STORAGE_KEY = "wlc-v1";
const CUSTOM_KEY  = "wlc-custom-v1";

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadCustomItems() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; } catch { return []; }
}
function saveCustomItems(items) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(items));
}

function getItems(phase) {
  const custom = loadCustomItems().filter(i => i.phase === phase);
  return [...ITEMS[phase], ...custom];
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  const state = loadState();

  ["pre", "post"].forEach(phase => {
    const ul = document.getElementById(`list-${phase}`);
    ul.innerHTML = "";

    getItems(phase).forEach(item => {
      const checked = !!state[item.id];
      const li = document.createElement("li");
      if (checked) li.classList.add("checked");

      li.innerHTML = `
        <input type="checkbox" id="${item.id}" ${checked ? "checked" : ""}>
        <label class="item-text" for="${item.id}">
          <div class="title">${escapeHtml(item.title)}</div>
          ${item.note ? `<div class="note">${escapeHtml(item.note)}</div>` : ""}
        </label>
      `;

      li.addEventListener("click", e => {
        if (e.target.tagName === "A") return;
        const cb = li.querySelector("input[type=checkbox]");
        const newVal = e.target === cb ? cb.checked : !cb.checked;
        if (e.target !== cb) cb.checked = newVal;
        const s = loadState();
        s[item.id] = newVal;
        saveState(s);
        render();
      });

      ul.appendChild(li);
    });

    updateCount(phase, state);
  });

  updateTotal(state);
}

function updateCount(phase, state) {
  const items = getItems(phase);
  const done  = items.filter(i => state[i.id]).length;
  const total = items.length;
  const pct   = total ? Math.round(done / total * 100) : 0;

  document.getElementById(`count-${phase}`).textContent = `${done} / ${total}`;
  document.getElementById(`rate-${phase}`).textContent  = `${pct}%`;
  document.getElementById(`bar-${phase}`).style.width   = `${pct}%`;
}

function updateTotal(state) {
  const all  = [...getItems("pre"), ...getItems("post")];
  const done = all.filter(i => state[i.id]).length;
  const pct  = Math.round(done / all.length * 100);
  document.getElementById("rate-total").textContent = `${pct}%`;
  document.getElementById("bar-total").style.width  = `${pct}%`;
}

["pre", "post"].forEach(phase => {
  document.getElementById(`form-${phase}`).addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById(`input-${phase}`);
    const title = input.value.trim();
    if (!title) return;
    const custom = loadCustomItems();
    custom.push({ id: `custom-${phase}-${Date.now()}`, phase, title, note: "" });
    saveCustomItems(custom);
    input.value = "";
    render();
  });
});

document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("すべてのチェックをリセットしますか？")) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

render();
