import http from "http";
import ollama from "ollama";

const port = 3000;

const server = http.createServer(async (req, res) =>
{
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight requests
    if (req.method === "OPTIONS")
    {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/api/chat")
    {
        let body = "";

        req.on("data", chunk =>
        {
            body += chunk.toString();
        });

        req.on("end", async () =>
        {
            try
            {
                const { messages, model = "llama3.1" } = JSON.parse(body);

                const response = await ollama.chat({
                    model: model,
                    messages: messages
                });

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ response: response.message }));
            }
            catch (error)
            {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: error.message }));
                console.error(error);
            }
        });
    }
    else
    {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(port, () =>
{
    console.log(`Ollama Chat API server running on port ${port}`);
});





