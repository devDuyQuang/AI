# KhaiFrost AI Core

A frontend-only AI receptionist concept built with React, TypeScript and Vite. No backend, API keys, accounts, payments or real bookings.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://localhost:5173).

```sh
npm run build
npm run preview
```

## Demo

Ask about hours or service prices, or select **Book appointment**. Pick a service, time and staff member to see a confirmation. Ask **reschedule** to change the latest appointment. Scenario cards start a fresh conversation while retaining demo bookings; **Reset Demo** clears both.

Conversation and appointments persist on this browser using `khaifrost_demo_session` and `khaifrost_demo_bookings`. If storage is blocked, the app remains usable and shows a persistence notice.

## Voice

Tap the mic to start and tap again to finish manually. Recognition uses continuous and interim results; each result updates the live transcript without submitting. After 2000ms without a new result, recognition stops. The completed transcript shows “✓ Got it” or “✓ Đã nhận” for 450ms before one chat submission.

Unexpected early endings restart at most twice while retaining transcript. If recognition cannot continue, use Continue speaking or Send now. Browser errors retain text for manual recovery. Reset, text submission and scenario changes cancel pending speech and timers.

Input language supports Auto, English and Tiếng Việt, persisted in `khaifrost_demo_input_language`. Auto uses the latest conversation language, falling back to browser language. It is not automatic multilingual recognition. Response language is detected separately using Vietnamese diacritics and common phrases, including unaccented Vietnamese. Booking buttons preserve the response language. Optional speech output chooses vi-VN/en-US voices when available.

Web Speech needs browser support, microphone permission, and HTTPS/localhost. Browser speech services may require internet. Silence detection measures time since transcript events, not microphone audio or semantic sentence completion; pauses over two seconds can finish a turn. Actual microphone accuracy and audio output require testing on the target device. Chat and mock AI use no external AI API.

## Structure

- `src/components/`: page sections, orb, chat, booking confirmation, context and scenarios.
- `src/data/demoData.ts`: salon services, staff and sample slots.
- `src/lib/mockAi.ts`: rule-based intent handling and booking/rescheduling state machine.
- `src/lib/storage.ts`: guarded browser persistence.
- `src/lib/speech.ts`: optional browser voice integration.
- `src/types/demo.ts`: shared types.
- `src/styles.css`: responsive custom design and motion preferences.

All availability is illustrative, appointments are local simulations, and human handoff does not actually notify anyone. Nail Art uses an estimated 30-minute duration for the demo. Product vision cards represent concept capabilities only.

## UX and voice checks

Desktop uses `min(94vw, 1540px)`, responsive typography, a compact voice stage and a separately scrolling conversation. Navigation scrolls without adding URL hashes.

With the development server running, browser regression scripts can be run on this Mac with installed Google Chrome:

```sh
DEMO_URL=http://localhost:5173/ node scripts/verify-browser.mjs
DEMO_URL=http://localhost:5173/ node scripts/verify-voice.mjs
```

The voice suite simulates browser speech events, including slow English/Vietnamese speech, 500/700ms pauses, the 2000ms silence boundary, duplicate end events, bounded restarts, manual finish and synthesis cancellation. Actual microphone accuracy and audible speech still require a manual check on the target browser/device.
