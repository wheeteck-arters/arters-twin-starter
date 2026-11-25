---
title: The case for small pull requests
type: article
source: linkedin-article
date: 2026-08-19
topics: [pull, requests, small, case]
summary: The case for small pull requests  Created on 2026-08-19  If I could change one habit across every engineering team I've worked with, it would be the size of pul
public: true
---

# The case for small pull requests

The case for small pull requests

Created on 2026-08-19

If I could change one habit across every engineering team I've worked with, it would be the size of pull requests.

Large pull requests are slow to review, so they wait. While they wait, they drift from the main branch, so they conflict. When they're finally reviewed, reviewers skim, because nobody can hold 1,500 lines in their head. Bugs get through, and the author feels the review was a formality.

Small pull requests, under about 200 lines, flip all of this. They get reviewed within hours, reviewers actually read them, and if something breaks it's easy to find and revert.

The objection I hear is that some changes are big. They are. But a big change can almost always be shipped as a series of small, safe steps behind a feature flag. Learning to slice work this way is one of the most valuable skills an engineer can build, and it's a skill AI coding tools make even more important.
