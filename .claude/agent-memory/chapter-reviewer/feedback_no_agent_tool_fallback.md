---
name: no-agent-tool-fallback
description: Some sessions only expose Read + Bash, no Agent/Task tool — handle gracefully
metadata:
  type: feedback
---

The chapter-reviewer system prompt assumes the seven sub-agents can be launched in parallel via the Agent/Task tool. In sessions where only Read and Bash are available, the orchestrator must execute all seven scopes sequentially itself.

**Why:** parallelism is a performance optimisation, not a correctness requirement. The deliverable is still the same prioritised punch list with seven sections; what changes is the surfacing.

**How to apply:**
- At the top of the report, add one sentence noting that the seven scopes were executed sequentially in-line (not via the Agent fanout) because the environment didn't expose the tool. This is *not* a sub-agent failure — don't insert warning blocks per section.
- Still produce all seven labelled sections in the standard order, even if some come back ✓.
- Still write the Recommendations paragraph with line-number citations.
- The severity ordering is unchanged.
