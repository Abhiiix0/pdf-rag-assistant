import { Index } from "@upstash/vector";

const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export async function getSummaryChunks(docid, maxChunks = 15) {
    const all = [];
    let cursor = "0";

    do {
        const page = await index.range({
            cursor,
            prefix: `${docid}-`,
            limit: 100,
            includeMetadata: true,
        });
        all.push(...page.vectors);
        cursor = page.nextCursor;
    } while (cursor);

    // restore reading order: 21-2 comes before 21-10
    all.sort((a, b) => Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]));

    // long PDF: pick chunks spread evenly across it
    const picked =
        all.length <= maxChunks
            ? all
            : Array.from(
                  { length: maxChunks },
                  (_, i) => all[Math.floor((i * all.length) / maxChunks)]
              );

    return picked.map((v) => ({ page: v.metadata.page, text: v.metadata.text }));
}
