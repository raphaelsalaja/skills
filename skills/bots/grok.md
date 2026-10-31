# Grok round

The user pastes the prompt below into a chat with their primary Bot, the one that coordinates the others. It asks which Bots to share, has each one clean and describe itself, then walks the user through publishing.

Publishing stays with the user. A template goes live only when they press Publish, so the prompt hands them a checklist instead of claiming it can publish.

## The prompt

Fill in the areas line before handing it over. With no areas from the user, leave the example areas in.

```text
I'm putting some of my Bots on my portfolio site. Each one gets a card and a link anyone can use to copy it. Run this in four rounds and stop for my answer after each.

Areas for grouping: Work, Training, Life

Round 1, pick. List every Bot I have, yourself included, one per line: a number, its name, its label and its job in one line. Then ask which ones to share. Share nothing until I answer. I may answer with numbers, "all" or "all except".

Round 2, clean. A public template shows a Bot's identity, description, skills and routines to anyone with the link. Send each Bot I picked this message and collect the replies:

"Read your own identity, description, skills and routines as a stranger would. List anything private: emails, phone numbers, addresses, other people's names, clients, employers, private projects, internal links, API keys, tokens, account details and personal facts about me such as health, money or where I live. For each item, propose public wording or removal. Logins and contact details belong in Vault, and personal facts belong in memory. Change nothing yet."

Show me every finding grouped by Bot and wait. When I approve, tell each Bot to apply exactly what I approved and confirm it is done. If I'm unsure about an item, it stays out.

Round 3, describe. Send each picked Bot this message and collect the replies:

"Describe yourself for a portfolio card as one JSON object with these keys, and nothing private:
- title: your job title in Title Case, 2 or 3 words, such as Sleep Coach
- area: one of the areas I gave
- description: one line under 15 words saying what you do
- does: 3 to 5 short items, each starting with a verb, under 7 words
- routines: each schedule in plain words with its time, such as Daily idea drop, 9am
- tools: the apps, plugins and sources you use, as short names
- shape: your picture's shape, one of blob, star, hex, heart, square, tablet, sparkle, flower, wedge, clover, teardrop, or null if unsure
- color: your picture's colour, one of black, gray, blue, cyan, green, yellow, orange, magenta, or null if unsure
- lead: true only if you are my primary Bot
No em dashes and no emoji."

Round 4, publish. Give me a checklist with one line per picked Bot: open the Bot, click its name, choose Share, then Create a copy, then Publish on the template card, then Copy link. On a phone it is the Bot's menu, then Share as Template. I'll paste each link back. Match it to its Bot and check it opens on x.ai. A Bot with no link yet keeps "shareUrl": null.

When I say done, save every entry as one JSON array in bots.json in the shared computer's home folder, add shareUrl to each, and paste the same array here. End with the Bots still missing a link and anything I left unsure.
```

## What comes back

One JSON array, one object per picked Bot. The skill reads it in step 2.

```json
[
  {
    "title": "Sleep Coach",
    "area": "Life",
    "description": "Guards a steady bedtime and a calm wind-down.",
    "does": ["Plans the evening wind-down", "Tracks sleep against goals", "Nudges before late screens"],
    "routines": ["Nightly wind-down, 10pm", "Weekly sleep review, Sunday"],
    "tools": ["Calendar", "Health"],
    "shape": "blob",
    "color": "blue",
    "lead": false,
    "shareUrl": null
  }
]
```

A `null` shape or colour is asked of the user, never guessed. A Bot the user did not pick is never in the array.
