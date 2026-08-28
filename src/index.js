// 最新の位置情報を保持する変数
let lastKnownLocation = {
  name: "Aちゃん",
  updatedAt: null,
  lat: 35.636667,
  lng: 139.881667,
  battery: 85,
  raw_data: null
};

// HTMLテンプレート
const INDEX_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>見守りMAP</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

<style>
body{
    margin:0;
    font-family: 'M PLUS Rounded 1c', sans-serif;
    color: #2B1C0B;
    background:#FFF8EB;
    transition: background-color 0.5s ease;
}

body.emergency-mode {
    background: #FF2E2E !important;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 8px 20px 8px;
    box-sizing: border-box;
    position: relative;
}

header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 10px 0;
}

.menu-btn {
    position: absolute;
    left: 10px;
    background: white;
    border: 2px solid #2B1C0B;
    border-radius: 8px;
    width: 44px;
    height: 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 8px;
    box-sizing: border-box;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.menu-btn span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #2B1C0B;
    border-radius: 2px;
}

.sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 260px;
    height: 100%;
    background-color: #FFFFFF;
    box-shadow: 2px 0 10px rgba(0,0,0,0.3);
    transition: left 0.3s ease;
    z-index: 2000;
    padding: 20px 15px;
    box-sizing: border-box;
    overflow-y: auto;
}

.sidebar.open {
    left: 0;
}

.sidebar-title {
    font-size: 20px;
    font-weight: bold;
    border-bottom: 2px solid #FFF8EB;
    padding-bottom: 10px;
    margin-bottom: 20px;
    text-align: center;
}

.sidebar-btn {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: bold;
    font-family: 'M PLUS Rounded 1c', sans-serif;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}

.sub-menu {
    display: none;
    padding-left: 10px;
    margin-bottom: 10px;
}

.sub-menu.show {
    display: block;
}

.btn-add-user { background-color: #ff9800; color: white; }
.btn-rename { background-color: #9c27b0; color: white; }
.btn-delete-user { background-color: #e53935; color: white; }
.btn-home { background-color: #2e7d32; color: white; }
.btn-sub { background-color: #4caf50; color: white; font-size: 13px; padding: 10px; }
.btn-home.active { background-color: #e65100; animation: pulse-btn 1s infinite alternate; }
.btn-data { background-color: #0288d1; color: white; }
.btn-clear { background-color: #757575; color: white; }

@keyframes pulse-btn {
    0% { transform: scale(1); }
    100% { transform: scale(1.02); }
}

.overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: none; z-index: 1500;
}

.overlay.show { display: block; }

.modal {
    display: none;
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: white; padding: 20px;
    border-radius: 12px; border: 2px solid #2B1C0B;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 3000; width: 85%; max-width: 400px;
}

.modal-title { font-weight: bold; font-size: 18px; margin-bottom: 12px; text-align: center; }
.modal-input, .modal-select {
    width: 100%; padding: 10px; font-size: 14px;
    border: 1px solid #ccc; border-radius: 6px;
    box-sizing: border-box; margin-bottom: 12px; font-family: inherit;
}
.modal-btns { display: flex; gap: 8px; }
.modal-btns button {
    flex: 1; padding: 10px; border: none; border-radius: 6px;
    font-weight: bold; cursor: pointer; font-family: inherit;
}
.modal-btn-search { background: #0288d1; color: white; }
.modal-btn-delete { background: #e53935; color: white; }
.modal-btn-cancel { background: #757575; color: white; }

h1 { text-align:center; margin: 0; font-size: 24px; transition: color 0.5s ease; }
body.emergency-mode h1 { color: #FFFFFF; }

#map { width:100%; height:60vh; }
#map.selecting-home { cursor: crosshair !important; }

#info-container { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }

.info-card {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 15px; background: white; border: 2px solid #2B1C0B;
    border-radius: 12px; position: relative;
}

.info-card .user-name { font-weight: bold; font-size: 16px; min-width: 70px; }
.item { text-align:center; }
.distance { font-size:18px; font-weight: bold; color: #2B1C0B; }
.battery { font-size:16px; font-weight: bold; color: #2B1C0B; }

.card-emergency-btn {
    background: #D93025; color: #FFFFFF; border: none;
    border-radius: 8px; padding: 8px 12px; font-size: 13px;
    font-weight: bold; cursor: pointer; font-family: inherit;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s, transform 0.1s;
}
.card-emergency-btn:active { transform: scale(0.95); }

#emergencyBanner {
    display: none; margin-top: 15px; padding: 20px;
    background-color: #D93025; color: #FFFFFF; text-align: center;
    font-size: 32px; font-weight: bold; border: 4px solid #FFFFFF;
    border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    animation: pulse 1.2s infinite alternate;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 0.9; }
    100% { transform: scale(1.02); opacity: 1; }
}

.custom-pin {
    width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
    position: absolute; transform: rotate(-45deg);
    left: 50%; top: 50%; margin: -20px 0 0 -20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    display: flex; justify-content: center; align-items: center;
}

.custom-pin-content {
    transform: rotate(45deg); font-weight: bold; font-size: 13px;
    display: flex; justify-content: center; align-items: center;
    white-space: nowrap; overflow: hidden; max-width: 28px;
}

.home-pin { background: #FFFFFF; border: 2px solid #2B1C0B; }
.target-pin-1 { background: #4285F4; border: 2px solid #FFFFFF; color: #FFFFFF; }
.target-pin-2 { background: #E91E63; border: 2px solid #FFFFFF; color: #FFFFFF; }
.target-pin-default { background: #9C27B0; border: 2px solid #FFFFFF; color: #FFFFFF; }
</style>
</head>
<body>

<div id="sidebar" class="sidebar">
    <div class="sidebar-title">メニュー</div>
    <button class="sidebar-btn btn-add-user" onclick="openAddUserModal()">➕ 見守り対象を追加</button>
    <button class="sidebar-btn btn-rename" onclick="openRenameModal()">✏️ 名前の変更</button>
    <button class="sidebar-btn btn-delete-user" onclick="openDeleteModal()">🗑 対象者を削除</button>
    <button class="sidebar-btn btn-data" onclick="downloadLocationHistory()">📥 ログをダウンロード</button>
    <button class="sidebar-btn btn-clear" onclick="clearLocationHistory()">🗑 ログを削除</button>

    <button class="sidebar-btn btn-home" onclick="toggleHomeSubMenu()">🏠 家の位置を変更</button>
    <div id="homeSubMenu" class="sub-menu">
        <button id="changeHomeBtn" class="sidebar-btn btn-sub" onclick="toggleSetHomeMode()">📍 地図上をタップ</button>
        <button class="sidebar-btn btn-sub" onclick="openAddressModal()">🏠 住所を入力</button>
    </div>
</div>

<div id="overlay" class="overlay" onclick="closeMenu()"></div>

<div id="addressModal" class="modal">
    <div class="modal-title">家の住所を入力</div>
    <input type="text" id="addressInput" class="modal-input" placeholder="例: 東京都千代田区永田町1-7-1">
    <div class="modal-btns">
        <button class="modal-btn-cancel" onclick="closeAddressModal()">キャンセル</button>
        <button class="modal-btn-search" onclick="searchAddress()">設定</button>
    </div>
</div>

<div id="addUserModal" class="modal">
    <div class="modal-title">新しい見守り対象を追加</div>
    <input type="text" id="newUserNameInput" class="modal-input" placeholder="例: Bちゃん">
    <div class="modal-btns">
        <button class="modal-btn-cancel" onclick="closeAddUserModal()">キャンセル</button>
        <button class="modal-btn-search" onclick="addNewUser()">追加</button>
    </div>
</div>

<div id="renameModal" class="modal">
    <div class="modal-title">対象者の名前を変更</div>
    <select id="userSelectForRename" class="modal-select"></select>
    <input type="text" id="renameInput" class="modal-input" placeholder="新しい名前を入力">
    <div class="modal-btns">
        <button class="modal-btn-cancel" onclick="closeRenameModal()">キャンセル</button>
        <button class="modal-btn-search" onclick="saveNewName()">保存</button>
    </div>
</div>

<div id="deleteModal" class="modal">
    <div class="modal-title">見守り対象を削除</div>
    <select id="userSelectForDelete" class="modal-select"></select>
    <div class="modal-btns">
        <button class="modal-btn-cancel" onclick="closeDeleteModal()">キャンセル</button>
        <button class="modal-btn-delete" onclick="executeDeleteFromModal()">削除</button>
    </div>
</div>

<div class="container">
<header>
    <div class="menu-btn" onclick="toggleMenu()">
        <span></span><span></span><span></span>
    </div>
    <h1>見守りMAP</h1>
</header>

<div id="map"></div>
<div id="info-container"></div>
<div id="emergencyBanner">🚨 緊急事態発生 🚨</div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

<script>
let map;
let homeMarker;
let isSettingHome = false;

let targets = JSON.parse(localStorage.getItem("mapTargets")) || [
    { id: 1, name: "Aちゃん", pinClass: "target-pin-1", color: "#4285F4", battery: "--" }
];

const targetState = {};

const savedHome = JSON.parse(localStorage.getItem("homeLocation"));
let home = savedHome || { lat: 35.645000, lng: 139.891667 };

function initMap(){
    map = L.map('map').setView([home.lat, home.lng], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const homeIconHtml = \`
        <div class="custom-pin home-pin">
            <div class="custom-pin-content">🏠</div>
        </div>
    \`;

    const homeIcon = L.divIcon({
        className: '',
        html: homeIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    homeMarker = L.marker([home.lat, home.lng], { icon: homeIcon, title: "HOME" }).addTo(map);

    map.on('click', function(e) {
        if (isSettingHome) {
            updateHomePosition(e.latlng.lat, e.latlng.lng);
            toggleSetHomeMode();
        }
    });

    targets.forEach(target => {
        setupTargetOnMap(target);
    });

    // 3秒周期で Workers の API から位置情報を取得する
    setInterval(fetchRealTimeLocation, 3000);
    fetchRealTimeLocation();
}

function setupTargetOnMap(target) {
    const pinHtml = \`
        <div class="custom-pin \${target.pinClass || 'target-pin-default'}">
            <div class="custom-pin-content" id="pin-label-\${target.id}">\${target.name.substring(0, 2)}</div>
        </div>
    \`;

    const pinIcon = L.divIcon({
        className: '',
        html: pinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    const initialPoint = [home.lat, home.lng];
    const marker = L.marker(initialPoint, { icon: pinIcon, title: target.name }).addTo(map);
    const trackLine = L.polyline([], { color: target.color || '#9C27B0', weight: 5, opacity: 0.7 }).addTo(map);

    targetState[target.id] = {
        marker: marker,
        trackLine: trackLine,
        pathHistory: [],
        lastPos: initialPoint
    };

    renderInfoCard(target);
}

function renderInfoCard(target) {
    const container = document.getElementById("info-container");
    let card = document.getElementById(\`info-card-\${target.id}\`);

    if (!card) {
        card = document.createElement("div");
        card.id = \`info-card-\${target.id}\`;
        card.className = "info-card";
        container.appendChild(card);
    }

    card.innerHTML = \`
        <div class="user-name" id="card-name-\${target.id}">\${target.name}</div>
        <div class="item">
            <div style="font-size:20px;">📏</div>
            <div class="distance" id="dist-\${target.id}">-- m</div>
        </div>
        <div class="item">
            <div style="font-size:20px;">🔋</div>
            <div class="battery" id="batt-\${target.id}">\${target.battery || '--'}%</div>
        </div>
        <button class="card-emergency-btn" onclick="triggerEmergencyFor('\${target.name}')">🚨 緊急</button>
    \`;
}

async function fetchRealTimeLocation() {
    try {
        const response = await fetch('/api/location');
        const data = await response.json();

        if (data && data.lat && data.lng) {
            const lat = parseFloat(data.lat);
            const lng = parseFloat(data.lng);
            
            // ID 1 (Aちゃん) の位置情報を自動更新
            updateTargetLocation(1, lat, lng, data.battery);
        }
    } catch (e) {
        console.error("データ取得エラー:", e);
    }
}

function updateTargetLocation(id, lat, lng, battery) {
    const state = targetState[id];
    if (!state) return;

    const currentPos = [lat, lng];
    state.lastPos = currentPos;

    state.marker.setLatLng(currentPos);

    state.pathHistory.push(currentPos);
    if (state.pathHistory.length > 20) {
        state.pathHistory.shift();
    }
    state.trackLine.setLatLngs(state.pathHistory);

    const dist = getDistance(home.lat, home.lng, lat, lng);
    const distEl = document.getElementById(\`dist-\${id}\`);
    if (distEl) {
        distEl.innerText = Math.round(dist) + " m";
    }

    const battEl = document.getElementById(\`batt-\${id}\`);
    if (battEl && battery !== undefined) {
        battEl.innerText = battery + "%";
    }

    saveLocationToLocalStorage(id, lat, lng);
}

function saveTargetsToStorage() {
    localStorage.setItem("mapTargets", JSON.stringify(targets));
}

function openAddUserModal() {
    closeMenu();
    document.getElementById("addUserModal").style.display = "block";
    document.getElementById("overlay").classList.add("show");
}

function closeAddUserModal() {
    document.getElementById("addUserModal").style.display = "none";
    document.getElementById("overlay").classList.remove("show");
    document.getElementById("newUserNameInput").value = "";
}

function addNewUser() {
    const name = document.getElementById("newUserNameInput").value.trim();
    if (!name) return alert("名前を入力してください。");

    const newId = Date.now();
    const newTarget = {
        id: newId,
        name: name,
        pinClass: "target-pin-default",
        color: "#9C27B0",
        battery: "--"
    };

    targets.push(newTarget);
    saveTargetsToStorage();
    setupTargetOnMap(newTarget);

    alert(\`\${name} さんを追加しました。\`);
    closeAddUserModal();
}

function removeUser(id) {
    const target = targets.find(t => t.id === id);
    if (!target) return;
    if (!confirm(\`\${target.name} さんを削除してもよろしいですか？\`)) return;

    if (targetState[id]) {
        if (targetState[id].marker) map.removeLayer(targetState[id].marker);
        if (targetState[id].trackLine) map.removeLayer(targetState[id].trackLine);
        delete targetState[id];
    }

    const card = document.getElementById(\`info-card-\${id}\`);
    if (card) card.remove();

    targets = targets.filter(t => t.id !== id);
    saveTargetsToStorage();
}

function openDeleteModal() {
    closeMenu();
    const select = document.getElementById("userSelectForDelete");
    select.innerHTML = "";
    if (targets.length === 0) return alert("削除できる対象者がいません。");

    targets.forEach(target => {
        const opt = document.createElement("option");
        opt.value = target.id;
        opt.innerText = target.name;
        select.appendChild(opt);
    });

    document.getElementById("deleteModal").style.display = "block";
    document.getElementById("overlay").classList.add("show");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    document.getElementById("overlay").classList.remove("show");
}

function executeDeleteFromModal() {
    const select = document.getElementById("userSelectForDelete");
    const targetId = parseInt(select.value, 10);
    closeDeleteModal();
    removeUser(targetId);
}

function openRenameModal() {
    closeMenu();
    const select = document.getElementById("userSelectForRename");
    select.innerHTML = "";
    targets.forEach(target => {
        const opt = document.createElement("option");
        opt.value = target.id;
        opt.innerText = target.name;
        select.appendChild(opt);
    });
    document.getElementById("renameInput").value = "";
    document.getElementById("renameModal").style.display = "block";
    document.getElementById("overlay").classList.add("show");
}

function closeRenameModal() {
    document.getElementById("renameModal").style.display = "none";
    document.getElementById("overlay").classList.remove("show");
}

function saveNewName() {
    const select = document.getElementById("userSelectForRename");
    const targetId = parseInt(select.value, 10);
    const newName = document.getElementById("renameInput").value.trim();

    if (!newName) return alert("新しい名前を入力してください。");

    const target = targets.find(t => t.id === targetId);
    if (target) {
        target.name = newName;
        saveTargetsToStorage();

        const pinLabel = document.getElementById(\`pin-label-\${targetId}\`);
        if (pinLabel) pinLabel.innerText = newName.substring(0, 2);

        const cardName = document.getElementById(\`card-name-\${targetId}\`);
        if (cardName) cardName.innerText = newName;

        alert("名前を更新しました。");
        closeRenameModal();
    }
}

function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("show");
}

function closeMenu() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
    document.getElementById("homeSubMenu").classList.remove("show");
}

function toggleHomeSubMenu() {
    document.getElementById("homeSubMenu").classList.toggle("show");
}

function toggleSetHomeMode() {
    isSettingHome = !isSettingHome;
    const btn = document.getElementById("changeHomeBtn");
    const mapElement = document.getElementById("map");

    if (isSettingHome) {
        btn.innerText = "📍 地図上をクリック中...";
        btn.classList.add("active");
        mapElement.classList.add("selecting-home");
    } else {
        btn.innerText = "📍 地図上をタップ";
        btn.classList.remove("active");
        mapElement.classList.remove("selecting-home");
    }
    closeMenu();
}

function openAddressModal() {
    closeMenu();
    document.getElementById("addressModal").style.display = "block";
    document.getElementById("overlay").classList.add("show");
}

function closeAddressModal() {
    document.getElementById("addressModal").style.display = "none";
    document.getElementById("overlay").classList.remove("show");
    document.getElementById("addressInput").value = "";
}

async function searchAddress() {
    const address = document.getElementById("addressInput").value.trim();
    if (!address) return alert("住所を入力してください。");

    try {
        const url = \`https://msearch.gsi.go.jp/address-search/AddressSearch?q=\${encodeURIComponent(address)}\`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const coords = data[0].geometry.coordinates;
            updateHomePosition(coords[1], coords[0]);
            map.setView([coords[1], coords[0]], 18);
            alert(\`家の位置を更新しました:\\n\${data[0].properties.title}\`);
            closeAddressModal();
        } else {
            alert("該当する住所が見つかりませんでした。");
        }
    } catch (error) {
        console.error("住所検索エラー:", error);
        alert("住所の検索中にエラーが発生しました。");
    }
}

function updateHomePosition(newLat, newLng) {
    home.lat = newLat;
    home.lng = newLng;
    localStorage.setItem("homeLocation", JSON.stringify(home));

    if (homeMarker) homeMarker.setLatLng([newLat, newLng]);

    targets.forEach(t => {
        const st = targetState[t.id];
        if (st && st.lastPos) {
            const dist = getDistance(home.lat, home.lng, st.lastPos[0], st.lastPos[1]);
            const distEl = document.getElementById(\`dist-\${t.id}\`);
            if (distEl) distEl.innerText = Math.round(dist) + " m";
        }
    });
}

function triggerEmergencyFor(userName) {
    document.body.classList.add("emergency-mode");
    const banner = document.getElementById("emergencyBanner");
    if (banner) {
        banner.innerText = \`🚨 \${userName}さん 緊急事態発生 🚨\`;
        banner.style.display = "block";
    }
}

function saveLocationToLocalStorage(id, lat, lng) {
    const history = JSON.parse(localStorage.getItem("locationLogs") || "[]");
    history.push({
        userId: id,
        timestamp: new Date().toISOString(),
        lat: lat,
        lng: lng
    });
    localStorage.setItem("locationLogs", JSON.stringify(history));
}

function downloadLocationHistory() {
    const history = localStorage.getItem("locationLogs");
    if (!history || JSON.parse(history).length === 0) {
        return alert("保存された位置情報データがありません。");
    }
    const blob = new Blob([history], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`location_history_\${new Date().toISOString().slice(0,10)}.json\`;
    a.click();
    URL.revokeObjectURL(url);
    closeMenu();
}

function clearLocationHistory() {
    if (confirm("保存された位置情報ログをすべて削除しますか？")) {
        localStorage.removeItem("locationLogs");
        alert("ログを削除しました。");
    }
    closeMenu();
}

function getDistance(lat1, lon1, lat2, lon2){
    const R = 6371000;
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

window.onload = initMap;
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS対応 (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. POST リクエストの受信処理 (ESP8684からの送信用)
    if (request.method === "POST") {
      try {
        const rawBody = await request.text();
        let body = {};
        try { body = JSON.parse(rawBody); } catch (e) { body = { data: rawBody }; }

        let lat = null;
        let lng = null;

        // "lat,lng" 形式の文字列パース
        if (body.data && typeof body.data === "string") {
          const parts = body.data.split(",");
          if (parts.length >= 2) {
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
          }
        }
        if (!lat && body.lat) lat = parseFloat(body.lat);
        if (!lng && body.lng) lng = parseFloat(body.lng);

        if (lat && lng) {
          lastKnownLocation = {
            name: "Aちゃん",
            updatedAt: new Date().toISOString(),
            lat: lat,
            lng: lng,
            battery: body.batt || body.battery || 85,
            raw_data: rawBody
          };
        }

        return new Response(JSON.stringify({ status: "success", location: lastKnownLocation }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.toString() }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 3. ブラウザからの位置情報 API 呼び出し
    if (url.pathname === "/api/location") {
      return new Response(JSON.stringify(lastKnownLocation), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 4. トップページ表示 (HTML)
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(INDEX_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
