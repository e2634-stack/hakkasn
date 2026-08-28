
let lastKnownLocation = {
  name: "Aちゃん",
  updatedAt: null,
  lat: null,
  lng: null,
  battery: null,
  raw_data: null
};

// HTMLコードを直接変数として保持
const INDEX_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aちゃん Location Tracker</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; }
    #map { height: 100vh; width: 100vw; }
    .info-card {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .info-card h2 { margin: 0 0 6px 0; font-size: 16px; }
    .info-card p { margin: 4px 0; font-size: 13px; color: #333; }
  </style>
</head>
<body>
  <div class="info-card">
    <h2>Aちゃんの現在地</h2>
    <p>最終更新: <span id="updated-at">取得中...</span></p>
    <p>バッテリー: <span id="battery">--</span>%</p>
  </div>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([34.6492, 134.9972], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    async function updateLocation() {
      try {
        const response = await fetch('/api/location');
        const data = await response.json();

        if (data.lat && data.lng) {
          const latLng = [data.lat, data.lng];
          document.getElementById('updated-at').textContent = data.updatedAt ? new Date(data.updatedAt).toLocaleString('ja-JP') : 'なし';
          document.getElementById('battery').textContent = data.battery || '--';

          if (!marker) {
            marker = L.marker(latLng).addTo(map).bindPopup("Aちゃんの位置").openPopup();
          } else {
            marker.setLatLng(latLng);
          }
          map.setView(latLng, 15);
        }
      } catch (err) {
        console.error("Fetch failure:", err);
      }
    }

    setInterval(updateLocation, 5000);
    updateLocation();
  </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. POST リクエスト処理 (ESP8684 / PC からのデータ受信)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        console.log("ESP8684 Received:", JSON.stringify(body));

        let parsedData = {};
        if (body.data) {
          try {
            parsedData = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
          } catch (e) {
            const parts = body.data.split(",");
            if (parts.length >= 2) {
              parsedData = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
            }
          }
        }

        lastKnownLocation = {
          name: "Aちゃん",
          updatedAt: new Date().toISOString(),
          lat: parsedData.lat || body.lat || null,
          lng: parsedData.lng || body.lng || null,
          battery: parsedData.batt || body.batt || null,
          raw_data: body.data || JSON.stringify(body)
        };

        console.log("A's Location Updated:", JSON.stringify(lastKnownLocation));

        return new Response(JSON.stringify({ status: "success", location: lastKnownLocation }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Post Error:", error);
        return new Response(JSON.stringify({ error: "Invalid Data Format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 2. 位置情報取得 API
    if (url.pathname === "/api/location") {
      return new Response(JSON.stringify(lastKnownLocation, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 3. トップページ（/）にアクセスした場合は直接 HTML を出力
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(INDEX_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
