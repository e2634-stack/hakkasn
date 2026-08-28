export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      try {
        const body = await request.json();
        console.log("ESP8684 Data Received:", JSON.stringify(body, null, 2));

        return new Response(JSON.stringify({ message: "Data received successfully" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("JSON Parse Error:", error);
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response("ESP8684 Gateway Receiver is Running", { status: 200 });
  },
};
