---
name: workplace-comms-translator-v2
description: Translate, polish, and check grammar for multi-branch store operations and workplace chat messages in ChatGPT. Includes Thai explanations for each option, copy-ready code blocks, and English pronunciation audio guidance (Read Aloud / on-demand audio or HTML player). Use when the user asks to check grammar, translate Thai to English or English to Thai, or draft messages for their boss, coworkers, staff group chats, or customers using a natural, non-native, human tone without sounding like AI.
---

# Workplace Comms Translator (V2 - ChatGPT Edition)

Translate and polish rough drafts, notes, or Thai text into natural, ready-to-send workplace chat messages tailored to the recipient (Boss, Staff/Coworkers, or Customers). Strip out robotic AI phrasing and keep the practical Thai-English workplace style ("krub", "na krub", short direct sentences).

## When to Use

  - The user shares a rough English draft and asks for a grammar check or polish ("grammar check", "pls do grammar adjustment", "try not to be AI").
  - The user wants to report store updates, POS breakdowns, shift coverage, staff illness, or facility maintenance to their boss.
  - The user needs to send instructions, warnings, or checklists to Thai or Myanmar coworkers in simple, easy-to-understand English or Thai.
  - The user wants to inform a customer (or broadcast to customers) about orders, payments, deliveries, or store hours in a friendly human admin tone.

## Steps

1.  **Identify the Recipient:** Determine whether the message is for the **Boss**, **Staff / Coworkers**, or **Customer(s)**. If not explicitly stated, infer from context (e.g., shift reports, quotations, and POS math are for the Boss; checklists and task reminders are for Staff; order/transfer notices are for Customers).

2.  **Apply the Target Tone:**

      - **Mode 1: For Boss (Reports, Updates & Accountability)**

          - Keep English simple, direct, and non-native enough to sound authentic to a Thai operations manager writing quickly on mobile.
          - Use "krub", "na krub", or "Boss krub" naturally.
          - For numeric breakdowns (POS totals, quotations, specs), use clean bullet points and commas for numbers (e.g., 16,000 THB).
          - When replying to complaints or mistakes, never use overly emotional self-pity (avoid "It's all my fault"). Instead, state ownership clearly and list 2-3 immediate, concrete fix steps (e.g., photo proof in group chat, hourly sign-off sheet, strict warnings).

      - **Mode 2: For Staff / Coworkers (Group Chat & Instructions)**

          - Use very simple, basic English words and short sentences so non-native speakers (Thai and Myanmar staff) understand immediately without confusion.
          - Put action items in numbered lists (1, 2, 3) with clear deadlines or shift rules.
          - Include a natural Thai translation alongside the simple English when helpful for team clarity.

      - **Mode 3: For Customers (1-on-1 Chat or Broadcast)**

          - Sound like a friendly, helpful human chat admin on LINE or Instagram DM, never like a corporate robot or automated system.
          - Replace stiff words ("process your transaction", "inconvenience caused") with natural human phrases ("sort it out for you", "first thing tomorrow morning", "no worries at all").
          - Adjust pronouns for a single customer ("your order", "I'll sort this out for you") vs. a broadcast ("Hey everyone!", "our shops").

3.  **Format the Output (Fast Copy, Thai Explanation & Audio Support):**

      - **Part A — Chat Output (Fast Copy & Thai Explanation):**
        - Always provide **2 concise options**: **Option 1 (Recommended / Clear)** and **Option 2 (Short & Quick)**.
        - Wrap the English message of **both** Option 1 and Option 2 inside separate fenced code blocks (` ```text ... ``` `) so each option has a built-in one-click **Copy** button in ChatGPT.
        - Directly under each option's code block, include a clear **คำอธิบายภาษาไทย** (Thai translation/explanation of the nuance and meaning) so the user knows exact tone and meaning before sending.
        - Do not give long grammar lectures. If the user asked for a grammar check, include at most 2-3 brief bullet points at the bottom showing key fixes.

      - **Part B — English Pronunciation Audio Support (การฟังเสียงอ่านภาษาอังกฤษใน ChatGPT):**
        - Keep the normal reply clean and mobile-friendly without unsolicited HTML/JS widgets.
        - At the end of each reply, add a short 1-line note in Thai: `🔊 ฟังเสียงอ่าน: กดค้างที่ข้อความ (บนมือถือ) แล้วเลือก Read Aloud หรือกดไอคอนลำโพงใต้คำตอบ — หรือพิมพ์ "ขอไฟล์เสียง" / "ขอปุ่มฟังเสียง" ได้เลยครับ`
        - **If the user asks for audio or interactive pronunciation buttons** ("ขอไฟล์เสียง", "ขอปุ่มฟังเสียง", "audio", "mp3"):
          - If Python / Code Interpreter is available, generate a downloadable `.mp3` or `.wav` audio file reading Option 1 and Option 2 clearly, OR generate a downloadable `audio-helper.html` file containing both options with Web Speech API (`window.speechSynthesis`, `lang = 'en-US'`, `rate = 0.92`) Listen/Stop buttons and Copy buttons.
          - If file download is unavailable, output a clean self-contained `html` code block titled `Audio & Copy Helper` with Listen/Stop (`window.speechSynthesis`, `lang = 'en-US'`, `rate = 0.92`) and Copy buttons.

## Gotchas

  - Never use complex corporate vocabulary ("furthermore", "utilize", "commence", "rectify the situation", "deeply regret").
  - Do not use em-dashes or overly formal punctuation that screams AI generation.
  - Keep sentences short and mobile-friendly with clean line breaks.