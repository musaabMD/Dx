import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

const systemPrompt = `You are the Lnkbase product assistant.
Lnkbase is a clean white-label SaaS for building universal AI chatbots that can answer questions, collect leads, escalate to humans, train from websites and files, and embed on customer sites.
Keep replies concise, practical, and focused on helping the visitor choose a plan, start a free trial, or understand setup.`;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return createFallbackResponse(messages);
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: system ?? systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: frontendTools(tools),
  });

  return result.toUIMessageStreamResponse();
}

function createFallbackResponse(messages: UIMessage[]) {
  const latestText = getLatestText(messages).toLowerCase();
  const text = pickFallbackReply(latestText);

  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const id = crypto.randomUUID();
      writer.write({ type: "text-start", id });

      for (const part of text.split(/(\s+)/)) {
        writer.write({ type: "text-delta", id, delta: part });
        await wait(18);
      }

      writer.write({ type: "text-end", id });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function getLatestText(messages: UIMessage[]) {
  const lastMessage = messages.at(-1);
  if (!lastMessage) return "";

  return lastMessage.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();
}

function pickFallbackReply(message: string) {
  if (message.includes("plan") || message.includes("pricing")) {
    return "For most teams, start with Free while you train and test the agent. Hobby is best for small sites, Standard adds help desk and API access, and Pro is for higher-volume support with advanced analytics.";
  }

  if (message.includes("embed") || message.includes("website")) {
    return "You can deploy Lnkbase as a website chat widget. Train the agent from your site, test it in Playground, then paste the embed script before the closing body tag.";
  }

  if (message.includes("lead") || message.includes("contact")) {
    return "Yes. Lnkbase can collect name, email, company, phone, page URL, and the conversation transcript when a visitor asks for a demo, quote, or human follow-up.";
  }

  if (message.includes("integration") || message.includes("tool")) {
    return "Lnkbase is designed for tools like Stripe, Shopify, Slack, Zendesk, HubSpot, Salesforce, Intercom, Calendly, and custom functions.";
  }

  return "Lnkbase helps you create a trained AI support agent for any website or product. You can import training content, test replies in Playground, collect leads, review chat logs, and deploy the widget on your site.";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
