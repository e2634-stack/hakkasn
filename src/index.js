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

    // 1. ESP8684 からの POST リクエスト処理
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

    // 2. Aちゃんの位置情報API
    if (url.pathname === "/api/location") {
      return new Response(JSON.stringify(lastKnownLocation, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 3. 上記以外（GETリクエスト等）は何も返さずフォールバック処理に任せる
    return new Response("Not Found", { status: 404 });
  },
};
