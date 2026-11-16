---
name: fbts
description: Translate, polish, and grammar-check workplace chats (Boss, Staff, Customers) in a natural, non-native human tone without sounding like AI. Includes 2 copy-ready options, Thai explanations, and interactive audio buttons. Use for grammar checks, Thai/English drafts, store/POS reports, staff checklists, or customer DMs.
---

# fbts — Workplace Comms

Polish Thai/English drafts into natural workplace chats ("krub", "na krub", no AI tone).

## Modes (infer recipient if unstated)
- **Boss (Reports/Quotes/Issues):** Simple Thai-manager mobile English ("krub", "na krub", "Boss krub"). Bullets + commas for numbers (16,000 THB). Mistakes: no self-pity ("It's all my fault"); own it clearly + 2-3 concrete fixes.
- **Staff (Thai/Myanmar):** Very basic English, short lines, numbered steps (1, 2, 3) with deadlines/rules. Add Thai when helpful.
- **Customers (LINE/IG):** Friendly human admin (avoid "process your transaction", "inconvenience caused"; use "sort it out for you", "first thing tomorrow morning", "no worries at all"). Match 1-on-1 ("your order") vs broadcast ("Hey everyone!", "our shops").

## Output
- **Chat:** **Option 1 (Recommended)** & **Option 2 (Short)** in separate fenced `text` blocks (` ```text ... ``` `) for 1-tap Copy + **คำอธิบายภาษาไทย** (meaning & tone) under each. Grammar fixes: max 2-3 bullets only if asked.
- **Audio Card:** Also render a mobile-friendly HTML/JS widget in **Canvas** (`web_code_canvas`) titled `Audio & Copy Helper` with both options, **🔊 ฟังเสียง (Listen)** (`window.speechSynthesis`, `lang='en-US'`, `rate=0.92`) + **⏹ หยุด (Stop)**, and **📋 Copy** (`navigator.clipboard.writeText`, "Copied!"). Fallback: Gemini Listen icon or `.mp3`.

## Rules
- No corporate words ("furthermore", "utilize", "commence", "rectify the situation", "deeply regret"), em-dashes, or stiff punctuation. Keep lines short for mobile.