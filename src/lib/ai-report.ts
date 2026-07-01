const AI_REPORT_URL = process.env.AI_REPORT_URL || "";
const AI_REPORT_API_KEY = process.env.AI_REPORT_API_KEY || "";

type AiReportResult = {
  content: string;
};

export async function generateAiReport(studyId: string, tenantId: string): Promise<AiReportResult> {
  if (!AI_REPORT_URL || !AI_REPORT_API_KEY) {
    throw new Error("AI Report service not configured. Set AI_REPORT_URL and AI_REPORT_API_KEY.");
  }

  const response = await fetch(AI_REPORT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_REPORT_API_KEY}`,
    },
    body: JSON.stringify({ studyId, tenantId }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AI Report service returned ${response.status}: ${body}`);
  }

  const data = await response.json();
  return { content: data.content || data.report || "" };
}
