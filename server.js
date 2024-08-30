import http from "http";
import ollama from "ollama";

const port = 3000;
const MODEL = "gemma2";

const API_POST_HANDLERS = {
    "/api/chat": async (parsedBody, req, res) =>
    {
        const { messages, model = "llama3.1" } = JSON.parse(body);

        const response = await ollama.chat({
            model: model,
            messages: messages
        });

        return response;
    },

    "/api/bondElements": async (parsedBody, req, res) =>
    {
        console.log(parsedBody);

        const llmMessage =
            `Can these atoms of chemical elements given by JSON form a bond? Return resulting chemical element in the same format. Do not add atoms. No coding just object as string. ${JSON.stringify(parsedBody.el1)}, ${JSON.stringify(parsedBody.el2)}`;
        console.log(llmMessage);

        const response = await ollama.generate({
            model: MODEL,
            prompt: llmMessage
            // messages: [
            //     {
            //         role: "user",
            //         content: llmMessage
            //     }
            // ]
        });

        console.log(response);
        return response;
    }
};

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

    console.log(req.url, req.method);

    if (req.method === "POST" && API_POST_HANDLERS[req.url])
    {
        console.log("Handling post request");
        let body = "";

        req.on("data", chunk =>
        {
            body += chunk.toString();
        });

        req.on("end", async () =>
        {
            try
            {
                const parsedBody = JSON.parse(body);
                const response = await API_POST_HANDLERS[ req.url ](parsedBody, req, res);

                res.writeHead(200, { "Content-Type": "application/json" });
                if (response.response && typeof response.response === "string")
                {
                    res.end(JSON.stringify({ response: response.message }));
                }
                // res.end(JSON.stringify({ response: response.message }));
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





