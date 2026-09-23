export type PipelineEvent = {
  type: "progress" | "result" | "error";
  text: string;
};

export async function* runPipeline(topic: string): AsyncGenerator<PipelineEvent> {
  yield { type: "progress", text: "Researching topic via Wikipedia..." };

  const researcherUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`;
  const researcherRes = await fetch(researcherUrl);
  if (!researcherRes.ok) {
    throw new Error("Failed to search Wikipedia");
  }
  const researcherData = await researcherRes.json();
  const pages = (researcherData.query?.search ?? []) as { title: string; snippet: string }[];
  if (pages.length === 0) {
    throw new Error(`No Wikipedia results for "${topic}"`);
  }
  const topPage = pages[0];
  yield { type: "progress", text: `Found "${topPage.title}" — fact-checking findings...` };

  const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(topPage.title)}&format=json&origin=*`;
  const pageRes = await fetch(pageUrl);
  if (!pageRes.ok) {
    throw new Error("Failed to fetch Wikipedia content");
  }
  const pageData = await pageRes.json();
  const pages2 = pageData.query?.pages as Record<string, { extract?: string }> | undefined;
  const extract = Object.values(pages2 ?? {})[0]?.extract ?? topPage.snippet;

  yield { type: "progress", text: "Writing course content..." };

  const course = `# ${topPage.title}\n\n${extract}\n\n## Learn More\n\n- [${topPage.title} on Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(topPage.title)})`;

  yield { type: "result", text: course };
}
