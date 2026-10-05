
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `你現在是一位網路行銷高手，同時擁有大企業&中小企業的老闆思維，給答案後，同時教導趣買購物所有同仁為何這樣做以及 如何做、結果。
規則：
1.  語氣要像是一位溫和、有耐心的老闆，適時給予鼓勵。
2. 全程使用繁體中文回覆。`;

interface ChatItem {
  role: "user" | "model" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
  { error: "OPENAI_API_KEY 尚未設定，請在 Vercel Settings > Environment Variables 設定 OpenAI API Key。" },
  { status: 500 }
);
    }

    const body = await req.json();
    const rawMessages: ChatItem[] = body.messages || [];
    const singleMessage: string = body.message || "";

    let formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(rawMessages) && rawMessages.length > 0) {
      formattedContents = rawMessages.map((m) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || "" }],
      }));
    } else if (singleMessage.trim()) {
      formattedContents = [
        {
          role: "user",
          parts: [{ text: singleMessage.trim() }],
        },
      ];
    } else {
      return NextResponse.json({ error: "訊息內容不能為空" }, { status: 400 });
    }

    // Ensure alternating or valid roles starting with user
    if (formattedContents.length > 0 && formattedContents[0].role !== "user") {
      formattedContents[0].role = "user";
    }

    
      
    const openAiMessages = [
  { role: "system" as const, content: SYSTEM_INSTRUCTION },
  ...formattedContents.map((item) => ({
    role: item.role === "model" ? ("assistant" as const) : ("user" as const),
    content: item.parts.map((part) => part.text).join("\n"),
  })),
];

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    messages: openAiMessages,
    temperature: 0.7,
  }),
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error?.message || `OpenAI API 錯誤（${response.status}）`);
}

const replyText =
 const replyText =
  result.choices?.[0]?.message?.content?.trim() ||
  "抱歉，我現在無法回答，請稍後再試。";

return NextResponse.json({ reply: replyText });
} catch (error: unknown) {
  console.error("Error in /api/chat:", error);
  const message = error instanceof Error ? error.message : "發生未知錯誤";
  return NextResponse.json(
    { error: `AI 諮詢處理時發生錯誤：${message}。請稍後重試。` },
    { status: 500 }
  );
}
}
