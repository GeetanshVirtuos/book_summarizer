import { summarize_text, summarize_text_llm } from "./summarize_text.js";
import { PDFExtract } from 'pdf.js-extract';
import fs from 'fs/promises';
import { resolve } from "path";
import { rejects } from "assert";
const pdfExtract = new PDFExtract();



// Returns a summary of `entire_book` aiming for `targetWords` words.
// - If `res` is provided and headers are not sent, the function will send { summary } to the client.
// - Options:
//    - chunkWords (default 20000): how many words to feed to summarize_text_llm at once.
//    - maxIterations (default 3): safety cap for iterative summarization.
// Usage example:
//    const summary = await summarize_pdf_target(fullText, null, 500);
//    // or to auto-send: await summarize_pdf_target(fullText, res, 200);
export async function summarize_pdf_target(entire_book, res = null, targetWords = 20000, options = {}) {
  const CHUNK_WORDS = options.chunkWords || 20000;     // how many words per summarize_text_llm call
  const MAX_ITERATIONS = options.maxIterations || 3; // avoid infinite loops
  const MIN_TARGET = 1; // minimal allowed target

  // basic validation
  if (entire_book == null) throw new Error("No book text provided");
  if (!Number.isFinite(targetWords) || targetWords < MIN_TARGET) {
    throw new Error("Invalid targetWords; must be a positive number");
  }

  // // normalize input (if array of page texts is passed in, join them)
  // const text = Array.isArray(entire_book) ? entire_book.join(" ") : String(entire_book);

  // helper: split text into words robustly
  const toWords = (s) => (s || "").split(/\s+/).filter(Boolean);

  // helper: sequentially summarize an array of words in CHUNK_WORDS sized batches
  const summarizeChunks = async (wordsArray) => {
    let accumulated = "";
    for (let i = 0; i < wordsArray.length; i += CHUNK_WORDS) {
      const slice = wordsArray.slice(i, i + CHUNK_WORDS);
      if (slice.length === 0) continue;
      const chunkText = slice.join(" ");
      // NOTE: summarize_text_llm is treated as a black box that returns the complete summary string for the chunk.
      const s = await summarize_text_llm(chunkText);
      if (s && s.toString().trim()) {
        accumulated += (accumulated ? " " : "") + s.toString().trim();
      }
    }
    return accumulated;
  };

  // First pass: chunk+summarize the whole book
  const allWords = toWords(entire_book);
  if (allWords.length === 0) {
    // empty input -> empty output
    if (res && !res.headersSent) res.send({ summary: "" });
    return "";
  }

  let summary = "";
  try {
    if (allWords.length <= CHUNK_WORDS) {
      summary = await summarize_text_llm(allWords.join(" "));
    } else {
      summary = await summarizeChunks(allWords);
    }
  } catch (err) {
    // bubble up and optionally send HTTP 500 if res provided
    if (res && !res.headersSent) res.status(500).send({ error: err.message || String(err) });
    throw err;
  }

  // Iteratively compress the summary until it is <= targetWords or we hit the iteration cap
  let iter = 0;
  while (toWords(summary).length > targetWords && iter < MAX_ITERATIONS) {
    iter++;
    const summaryWords = toWords(summary);
    try {
      if (summaryWords.length <= CHUNK_WORDS) {
        summary = await summarize_text_llm(summaryWords.join(" "));
      } else {
        summary = await summarizeChunks(summaryWords);
      }
    } catch (err) {
      if (res && !res.headersSent) res.status(500).send({ error: err.message || String(err) });
      throw err;
    }
  }

  // Final safety truncation: if still longer than target, truncate to first targetWords words
  const finalWords = toWords(summary);
  if (finalWords.length > targetWords) {
    summary = finalWords.slice(0, targetWords).join(" ") + " ...";
  }

  // Optionally send result via Express res
  if (res && !res.headersSent) {
    try {

      // send summary as HTML (TODO: make an LLM call here)
      let html_summary = `
    <style>
      :root {
        --bg: #0f1724; /* deep navy */
        --card: #0b1220;
        --muted: #94a3b8;
        --accent1: #7c3aed; /* purple */
        --accent2: #06b6d4; /* teal */
        --glass: rgba(255, 255, 255, 0.04);
        --radius: 16px;
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
      }
      html,
      body {
        height: 100%;
        margin: 0;
        background: linear-gradient(180deg, var(--bg) 0%, #071028 100%);
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto,
          "Helvetica Neue", Arial;
        color: #e6eef8;
      }

      .wrap {
        max-width: 1100px;
        margin: 48px auto;
        padding: 28px;
      }

      header {
        display: flex;
        gap: 24px;
        align-items: center;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .mark {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--accent1), var(--accent2));
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(12, 18, 36, 0.6);
        font-family: "Playfair Display";
        font-weight: 700;
      }
      .mark span {
        font-size: 22px;
        color: white;
      }
      h1 {
        font-family: "Playfair Display";
        font-weight: 700;
        margin: 0;
        font-size: 34px;
        line-height: 1.05;
      }
      p.lead {
        color: var(--muted);
        margin: 6px 0 0;
      }

      .hero {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 28px;
        margin-top: 22px;
        align-items: start;
      }

      .panel {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(255, 255, 255, 0.01)
        );
        border-radius: var(--radius);
        padding: 20px;
      }

      .intro {
        padding: 28px;
        border-radius: 14px;
        background: linear-gradient(
          180deg,
          rgba(124, 58, 237, 0.06),
          rgba(6, 182, 212, 0.03)
        );
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
      }
      .kicker {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--accent2);
        font-weight: 600;
        font-size: 13px;
      }

      .summary {
        margin-top: 12px;
        color: #dbeafe;
      }

      .aside {
        position: relative;
      }
      .card-small {
        background: var(--card);
        padding: 18px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.03);
      }
      .muted {
        color: var(--muted);
        font-size: 14px;
      }
      .badge {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 10px;
        background: linear-gradient(90deg, var(--accent1), var(--accent2));
        color: white;
        font-weight: 700;
      }

      section {
        margin-top: 26px;
      }

      .grid {
        display: grid;
        gap: 14px;
      }
      .grid.cols-2 {
        grid-template-columns: repeat(2, 1fr);
      }
      .grid.cols-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      .card {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(255, 255, 255, 0.01)
        );
        padding: 18px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        box-shadow: 0 8px 30px rgba(2, 6, 23, 0.6);
      }
      .card h3 {
        margin: 0 0 8px;
        font-size: 16px;
      }
      .card p {
        margin: 0;
        color: var(--muted);
        font-size: 14px;
      }

      ul.clean {
        list-style: none;
        padding: 0;
        margin: 12px 0 0;
      }
      ul.clean li {
        padding: 8px 0;
        border-top: 1px dashed rgba(255, 255, 255, 0.02);
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .dot {
        min-width: 36px;
        height: 36px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--accent2), var(--accent1));
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
      .dot small {
        font-size: 12px;
        color: white;
      }

      .cases {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .case {
        padding: 14px;
        border-radius: 12px;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.01),
          rgba(255, 255, 255, 0.005)
        );
        border: 1px solid rgba(255, 255, 255, 0.02);
      }
      .case h4 {
        margin: 0 0 6px;
      }
      .case p {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
      }

      .approaches {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .approach {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .approach .num {
        width: 44px;
        height: 44;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        display: grid;
        place-items: center;
        font-weight: 700;
        color: var(--accent2);
      }
      .conclusion {
        margin-top: 18px;
        padding: 16px;
        border-left: 4px solid var(--accent1);
        background: linear-gradient(
          90deg,
          rgba(124, 58, 237, 0.02),
          transparent
        );
      }

      footer {
        margin-top: 28px;
        color: var(--muted);
        font-size: 13px;
        text-align: center;
      }

      /* responsive */
      @media (max-width: 880px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .grid.cols-3 {
          grid-template-columns: 1fr;
        }
        .cases {
          grid-template-columns: 1fr;
        }
      }
    </style>
    <div>
      <div class="wrap">
        <header>
          <div class="logo">
            <div class="mark" aria-hidden="true"><span>TE</span></div>
            <div>
              <div style="font-weight: 700">Transformation Economy</div>
              <div class="muted" style="margin-top: 4px">
                Competing on lasting outcomes
              </div>
            </div>
          </div>
          <div
            style="
              margin-left: auto;
              display: flex;
              gap: 10px;
              align-items: center;
            "
          >
            <div class="badge">Core Idea</div>
          </div>
        </header>

        <div class="hero">
          <main>
            <div class="panel intro">
              <div class="kicker">Core Idea</div>
              <h1 style="margin-top: 10px">
                Customers don’t buy products — they buy lasting transformations
              </h1>
              <p class="summary">
                Companies that design offerings to reliably change customers’
                lives — from health to skills to financial security — unlock
                deeper value, loyalty, and economic advantage.
              </p>
            </div>

            <section>
              <div class="card">
                <h3>Key Concepts</h3>
                <p>
                  Transformation is a distinct offering that goes beyond
                  commodities, goods, services, and experiences. Customers pay
                  for life changes, not merely access.
                </p>

                <ul class="clean" style="margin-top: 12px">
                  <li>
                    <div class="dot"><small>1</small></div>
                    <div>
                      <strong>Transformation as a Distinct Offering</strong>
                      <div class="muted">
                        Life changes > experiences. Charge for outcomes, not
                        just touchpoints.
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="dot"><small>2</small></div>
                    <div>
                      <strong>Principles of Transformation Businesses</strong>
                      <div class="muted">
                        Focus on customer success, adopt a solutions mindset,
                        require customer commitment.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <div class="card" style="margin-top: 14px">
                <h3>Process for Creating Transformations</h3>
                <p class="muted">
                  A practical blueprint: identify jobs, define success at
                  stages, and remove barriers.
                </p>

                <div style="margin-top: 12px">
                  <strong>Identify Jobs to Be Done</strong>
                  <ul
                    style="
                      margin: 8px 0 0;
                      padding-left: 18px;
                      color: var(--muted);
                    "
                  >
                    <li>
                      <strong>Functional</strong>: Practical tasks (e.g., losing
                      weight, relieving pain).
                    </li>
                    <li>
                      <strong>Emotional</strong>: Feelings to gain or reduce
                      (confidence, relief).
                    </li>
                    <li>
                      <strong>Social</strong>: Perceived identity (professional,
                      attractive).
                    </li>
                    <li>
                      <strong>Aspirational</strong>: Who they want to become
                      (secure, successful).
                    </li>
                  </ul>

                  <div style="margin-top: 12px">
                    <strong>Define Success at Each Stage</strong>
                    <div class="muted">
                      Break the transformation into milestones — clarity,
                      effective recommendations, affordability, measurable
                      outcomes.
                    </div>
                  </div>

                  <div style="margin-top: 12px">
                    <strong>Identify Barriers</strong>
                    <div class="muted">
                      Resources, readiness, and context (time, money, skills,
                      environment).
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 style="font-size: 18px; margin: 8px 0">
                Case Studies & Examples
              </h2>
              <div class="cases">
                <div class="case">
                  <h4>Profile by Sanford</h4>
                  <p class="muted">
                    Weight loss via customized plans + ongoing coaching —
                    outcome focus and accountability.
                  </p>
                </div>
                <div class="case">
                  <h4>TrueConnect</h4>
                  <p class="muted">
                    Affordable employee loans + counseling — avoids payday
                    traps, emphasizes financial stability.
                  </p>
                </div>
                <div class="case">
                  <h4>Noom</h4>
                  <p class="muted">
                    Behavior change through psychology-driven coaching and habit
                    formation.
                  </p>
                </div>
                <div class="case">
                  <h4>Georgia State University</h4>
                  <p class="muted">
                    Predictive analytics + personal support improved graduation
                    rates — institutional transformation.
                  </p>
                </div>
                <div class="case">
                  <h4>Resolve Solutions (RSI)</h4>
                  <p class="muted">
                    Career success for underrepresented youth via mentorship,
                    ROTC, and skills training.
                  </p>
                </div>
                <div class="case">
                  <h4>Texas Christian University</h4>
                  <p class="muted">
                    Integrated mental health care + partnerships to expand
                    access and outcomes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 style="font-size: 18px; margin: 8px 0">
                Five Approaches to Designing Transformation Offerings
              </h2>
              <div class="approaches">
                <div class="approach card">
                  <div class="num">1</div>
                  <div>
                    <strong>Integrate solutions</strong>
                    <div class="muted">
                      Combine resources from multiple providers into a single,
                      outcome-focused pathway.
                    </div>
                  </div>
                </div>
                <div class="approach card">
                  <div class="num">2</div>
                  <div>
                    <strong>Engage customers as partners</strong>
                    <div class="muted">
                      Co-create the transformation — buy-in matters.
                    </div>
                  </div>
                </div>
                <div class="approach card">
                  <div class="num">3</div>
                  <div>
                    <strong>Provide customized support</strong>
                    <div class="muted">
                      Tailor help to personal needs and signals.
                    </div>
                  </div>
                </div>
                <div class="approach card">
                  <div class="num">4</div>
                  <div>
                    <strong>Support all job types</strong>
                    <div class="muted">
                      Address functional, emotional, social, and aspirational
                      jobs.
                    </div>
                  </div>
                </div>
                <div class="approach card">
                  <div class="num">5</div>
                  <div>
                    <strong>Charge for outcomes</strong>
                    <div class="muted">
                      Align payment with real success (pay-for-success
                      contracts).
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div class="conclusion">
              <strong>Conclusion</strong>
              <p class="muted" style="margin-top: 8px">
                Competing on transformations is harder to imitate and creates
                deeper loyalty and economic value — and the real reward is
                making a profound difference in people’s lives.
              </p>
            </div>
          </main>

          <aside class="aside">
            <div class="card-small">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                "
              >
                <div>
                  <div style="font-weight: 700">Quick Facts</div>
                  <div class="muted" style="font-size: 13px">
                    A cheat-sheet to the transformation economy
                  </div>
                </div>
                <div style="text-align: right">
                  <div class="muted">Estimated impact</div>
                  <div
                    style="
                      font-weight: 800;
                      font-size: 18px;
                      color: var(--accent2);
                    "
                  >
                    High ↗
                  </div>
                </div>
              </div>

              <hr
                style="
                  border: none;
                  border-top: 1px solid rgba(255, 255, 255, 0.03);
                  margin: 12px 0;
                "
              />
              <div style="display: flex; flex-direction: column; gap: 8px">
                <div style="display: flex; justify-content: space-between">
                  <div class="muted">Customer commitment</div>
                  <div style="font-weight: 700">Required</div>
                </div>
                <div style="display: flex; justify-content: space-between">
                  <div class="muted">Business complexity</div>
                  <div style="font-weight: 700">Medium–High</div>
                </div>
                <div style="display: flex; justify-content: space-between">
                  <div class="muted">Monetization</div>
                  <div style="font-weight: 700">Outcomes & subscriptions</div>
                </div>
              </div>
            </div>

            <div style="height: 18px"></div>

            <div class="card-small card" style="padding: 14px">
              <h3 style="margin: 0 0 8px">How to get started</h3>
              <ol
                style="
                  margin: 0;
                  padding-left: 18px;
                  color: var(--muted);
                  font-size: 14px;
                "
              >
                <li>Map customers' JTBD and aspirations.</li>
                <li>Design milestone-based success metrics.</li>
                <li>Create bundled solutions & partner where needed.</li>
                <li>Test with a small cohort and measure outcomes.</li>
              </ol>
            </div>
          </aside>
        </div>

        <footer>
          <div>Made with care • Transformation Economy summary</div>
        </footer>
      </div>
    </div>
      `
      res.send({ summary: html_summary });
    } catch (sendErr) {
      // swallow send error but still return summary
      console.warn("Failed to send response:", sendErr);
    }
  }

  return summary; // As the function is "async", it actually returns a promise that resolves to "summary"
}


// Streaming version: Use Server-Sent Events (SSE) to stream summary chunks
// Also called progressive summary
export async function summarize_pdf_sse(pdf_buffer, res) {
    try {
        return new Promise((resolve, reject) => {
            const options = {
                lastPage: 20  
            }; 
            pdfExtract.extractBuffer(pdf_buffer, options, async (err, data) => {
                if (err) return reject(err);
                try {
                    for(let i=0; i<data.pages.length; i++){
                        if(data.pages.length >= 7 && i<5) continue; // Skip first 5 pages for books as they often contain Index or preface
                        let page = data.pages[i];
                        let pageText = page.content.map(item => item.str).join(' ');
                        let result = await summarize_text(pageText);
                        console.log('Sending chunk:', result);
                        res.write(`data: ${result}\n\n`);
                        // Optionally flush if available
                        if (res.flush) res.flush();
                    }
                    res.end();
                    resolve("Streaming complete");
                } catch (error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

// Example usage: Read the PDF file into a buffer
// const buffer = await fs.readFile('./sample_pdfs/pg_3_sample.pdf');
// summarize_pdf(buffer).then((result)=>{
//     console.log("PDF Summary:", result);
// }).catch((error)=>{
//     console.error("Error summarizing PDF:", error);
// });



