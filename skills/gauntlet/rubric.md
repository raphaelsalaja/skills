# Gauntlet rubric

The critic scores six criteria from 0 to 10 and names the three fixes that would raise the score most. The critic sees only the three screenshots and this file.

## Criteria

| Criterion | 10 means | 5 means | 0 means |
| --- | --- | --- | --- |
| Hierarchy | One clear first thing on each screen and one obvious primary action | Two or three things compete, or the primary action looks like the rest | No order, the eye has nowhere to start |
| Spacing | One rhythm, every edge on a shared line, equal siblings equal | Gaps and padding differ between siblings | Boxes collide or float |
| Type | One family and one scale, every size readable, numbers line up | Mixed families or sizes under 12px | Text unreadable |
| Colour | Every text and status readable, one accent, status never colour alone | Some text faint or status hard to tell apart | Text invisible |
| Content | Real labels and values, charts labelled, nothing placeholder | A placeholder or a broken value on screen | Mostly filler |
| Every view | Mobile and dark are as good as desktop | One view has a visible fault | One view is broken |

The overall score is the mean of the six, to one decimal. A criterion at 10 has nothing a stranger would change. 9 has only matters of taste. 7 has a visible fault. 5 has several. 3 has a broken area.

## What the critic returns

```json
{
  "scores": { "hierarchy": 6, "spacing": 5, "type": 6, "colour": 4, "content": 5, "views": 3 },
  "overall": 4.8,
  "fixes": [
    { "n": 1, "shot": "dark", "region": "cards", "what": "Cards stay white on a dark page", "why": "Text vanishes" },
    { "n": 2, "shot": "mobile", "region": "sidebar", "what": "The sidebar takes half the screen", "why": "Content is squeezed" },
    { "n": 3, "shot": "desktop", "region": "stat row", "what": "Four cards, four different paddings", "why": "Reads as a mistake" }
  ]
}
```

Each fix names one screenshot, one region and one change in plain words. It names no file, selector or colour value. It ranks by how much it would raise the overall score.

## The critic prompt

> You are seeing this interface for the first time. You have three screenshots: desktop, mobile and dark. Score it against the rubric, then name the three fixes that would raise the score most. You know nothing about how it was built, what was tried before or what anyone intended.

Pass nothing else: no code, no earlier score, no earlier critique and no list of known issues.
