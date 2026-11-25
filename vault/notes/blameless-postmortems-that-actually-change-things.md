---
title: Blameless postmortems that actually change things
type: article
source: linkedin-article
date: 2026-02-10
topics: [change, blameless, postmortems, three]
summary: Every team I've joined says it runs blameless postmortems.
public: true
---

# Blameless postmortems that actually change things

Every team I've joined says it runs blameless postmortems. Few of them change anything afterwards. The document gets written, the meeting happens, and three months later the same outage comes back wearing a different hat.

Blameless does not mean actionless. A good postmortem answers three questions: what happened, why it made sense to the people involved at the time, and what we will change so that the next person in the same situation succeeds.

The second question is the one teams skip. If you don't understand why a reasonable engineer ran that command, you will write an action item like 'be more careful', which is not an action item. It is a wish.

My rule: every postmortem must produce at most three actions, each with an owner and a date, and at least one must change a system rather than a person. We review open actions in the weekly ops meeting until they close. Since we started doing this, repeat incidents dropped by about half in a year.

## Related

- [[new-managers-often-ask-me-how-to-run-11s]]
