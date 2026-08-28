// 最新の位置情報を保持する変数（Workerが再起動するとリセットされるため、保持したい場合はKVやD1を使用します）
let lastKnownLocation = {
  name: "Aちゃん",
  updatedAt: null,
  lat: null,
  lng: null,
  battery: null,
  raw_data: null
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 【1】 ESP8684 からの POST リクエスト処理 (位置情報の受信)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        console.log("ESP8684 Received:", JSON.stringify(body));

        // 送信データの `data` フィールドを解析
        let parsedData = {};
        if (body.data) {
          try {
            // dataがJSON文字列の場合
            parsedData = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
          } catch (e) {
            // 文字列の場合（例: "34.6492,134.9972"）
            const parts = body.data.split(",");
            if (parts.length >= 2) {
              parsedData = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
            }
          }
        }

        // 位置情報の更新
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
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Post Error:", error);
        return new Response(JSON.stringify({ error: "Invalid Data Format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 【2】 位置情報API (GET /api/location でAちゃんの最新位置を取得)
    if (url.pathname === "/api/location") {
      return new Response(JSON.stringify(lastKnownLocation, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // フロントエンドからのアクセスを許可
        }
      });
    }

    // 【3】 その他のGETリクエスト（既存のWeb画面・画像等を表示）
    return env.ASSETS.fetch(request);
  },
};
