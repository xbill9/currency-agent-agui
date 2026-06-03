import {
  CopilotRuntime,
  createCopilotEndpoint,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";
import { handle } from "hono/vercel";

const runtime = new CopilotRuntime({
  agents: {
    currency_agent: new HttpAgent({
      url: process.env.AGENT_URL || "http://localhost:11000/apps/currency_agent",
    }),
  },
  runner: new InMemoryAgentRunner(),
});

const app = createCopilotEndpoint({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handle(app);
export const POST = handle(app);
