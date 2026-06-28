import { NextRequest } from "next/server";
import { openai } from "@/lib/openai-client";

export async function POST(request: NextRequest) {
  try {
    const { productName, productDescription, platform, targetAudience, brandVoice } = await request.json();

    if (!productName || !productDescription) {
      return new Response(JSON.stringify({ error: "Product name and description required" }), { status: 400 });
    }

    const systemPrompt = `You are an expert ad copywriter. Generate high-converting ad copy for the following product.
Return the response in JSON format with the following keys:
- hook: A catchy opening line
- body: The main ad content highlighting benefits
- cta: A strong call to action
- targeting: Suggested audience targeting tips`;

    const userPrompt = `Product Name: ${productName}
Product Description: ${productDescription}
Platform: ${platform}
Target Audience: ${targetAudience}
Brand Voice: ${brandVoice}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return new Response(content, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Ad copy generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
