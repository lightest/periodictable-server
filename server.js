import http from "http";
import ollama from "ollama";

const port = 3000;
const MODEL = "gemma2"; // Bset so far.
// const MODEL = "mistral-nemo";

const PROMPTS = {
    chemicalBalanceEquation: (equation) => {
        return `Solve chemical ballance equation such that it's accurate acoording to the laws of chemistry: ${equation}. Output solution directly.`;
    },

    describeElement: (elementName) =>
    {
        return `Give me short, professional, on point description of chemical element: ${elementName} as if from wikipedia page preview. Use plain text.`;
    },

    bondChemicals: "Conduct chemical reaction using given chemicals and atoms. Return resulting chemical with formula, name and amount of atoms for each element. Use only given atoms. Use format {formula: 'formula', name: 'name_of_chemical', elements: [{symbol, name, atoms}]}. If there are more than one chemical as a result of the chemical reaction, return all of them in the array. Return response directly, do not use markdown. Elements:"
};

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

    "/api/describeElement": async (parsedBody, req, res) =>
    {
        console.log(parsedBody);

        const llmMessage = PROMPTS.describeElement(parsedBody.element.name);
        console.log(llmMessage);

        const response = await ollama.generate({
            model: MODEL,
            prompt: llmMessage
        })

        console.log(response);

        return response;
    },


    "/api/solveChemicalBalanceEquation": async (parsedBody, req, res) =>
    {
        console.log(parsedBody);

        const llmMessage = PROMPTS.chemicalBalanceEquation(parsedBody.equation);
        console.log(llmMessage);

        const response = await ollama.generate({
            model: MODEL,
            prompt: llmMessage
        })

        console.log(response);

        return response;
    },

    "/api/bondElements": async (parsedBody, req, res) =>
    {
        console.log(parsedBody);
        let elements = [];
        for (let i = 0; i < parsedBody.elements.length; i++)
        {
            elements.push(JSON.stringify(parsedBody.elements[i]));
        }

        const llmMessage = `${PROMPTS.bondChemicals} ${elements.join(", ")}`;
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
                    res.end(JSON.stringify({ response: response.response }));
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





