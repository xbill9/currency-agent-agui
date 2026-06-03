"use client";

import { ExchangeRateCard } from "@/components/currency";
import {
  useAgent,
  useFrontendTool,
  useRenderTool,
  CopilotSidebar,
} from "@copilotkit/react-core/v2";
import React, { useState } from "react";

export default function CopilotKitPage() {
  const [themeColor, setThemeColor] = useState("#10b981"); // Mint green primary theme

  // 🪁 Frontend Actions
  useFrontendTool({
    name: "setThemeColor",
    parameters: [
      {
        name: "themeColor",
        description: "The theme color to set. Make sure to pick nice colors.",
        required: true,
      },
    ],
    handler({ themeColor }) {
      setThemeColor(themeColor);
    },
  });

  return (
    <main
      style={
        { "--copilot-kit-primary-color": themeColor } as React.CSSProperties
      }
    >
      <CopilotSidebar
        disableSystemMessage={true}
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "Currency Intelligence Assistant",
          initial: "👋 Hi! I can help you convert currencies and look up exchange rates. Try asking for a conversion below!",
        }}
        suggestions={[
          {
            title: "Convert USD to EUR",
            message: "How much is 250 USD in EUR?",
          },
          {
            title: "Compare USD to GBP",
            message: "What is the exchange rate for USD to GBP?",
          },
          {
            title: "Convert CAD to USD",
            message: "Can you convert 1500 CAD to USD?",
          },
          {
            title: "Latest Rates",
            message: "Get the current exchange rate for USD to JPY.",
          },
        ]}
      >
        <YourMainContent themeColor={themeColor} />
      </CopilotSidebar>
    </main>
  );
}

function YourMainContent({ themeColor }: { themeColor: string }) {
  // 🪁 Shared State with ADK Agent
  const { agent } = useAgent({
    agentId: "currency_agent",
  });
  
  const state = agent.state ?? {};

  // 🪁 Generative UI: Renders the ExchangeRateCard dynamically during agent tool calls
  useRenderTool(
    {
      name: "get_exchange_rate",
      render: ({ parameters, result }) => {
        const from = (parameters as any)?.currency_from || "USD";
        const to = (parameters as any)?.currency_to || "EUR";
        const rate = (result as any)?.rates?.[to] || (result as any)?.rates?.[to.toUpperCase()];
        const date = (result as any)?.date;

        return (
          <ExchangeRateCard
            currencyFrom={from}
            currencyTo={to}
            rate={rate}
            date={date}
            themeColor={themeColor}
          />
        );
      },
    },
    [themeColor],
  );

  return (
    <div
      style={{ backgroundColor: "#0f172a" }} // Matches deep dark-theme
      className="h-screen flex justify-center items-center flex-col transition-colors duration-300 px-6 text-center"
    >
      <div className="max-w-md bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <span className="text-5xl mb-4 block">💵</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Currency Intellect
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Generative UI Workspace powered by CopilotKit and Google ADK. Ask the assistant to query rates.
        </p>
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => setThemeColor("#10b981")} 
            className="w-8 h-8 rounded-full border-2 border-white/20 bg-emerald-500" 
          />
          <button 
            onClick={() => setThemeColor("#3b82f6")} 
            className="w-8 h-8 rounded-full border-2 border-white/20 bg-blue-500" 
          />
          <button 
            onClick={() => setThemeColor("#ec4899")} 
            className="w-8 h-8 rounded-full border-2 border-white/20 bg-pink-500" 
          />
        </div>
      </div>
    </div>
  );
}
