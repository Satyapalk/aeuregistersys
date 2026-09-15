# AEU Student Registration System

Student registration form for **Asia Europe University** (សាកលវិទ្យាល័យអាស៊ីអឺរ៉ុប). Collects student data and forwards it to the .NET API (UMSRG2026), which owns the Telegram bot (notifications, chat linking, payment/check-in reminders).

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Kantumruy Pro** (Khmer font)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```
REG_SEQ_FILE=/absolute/path/to/registration-seq.txt
```

> The registration counter lives in `REG_SEQ_FILE` (default `.data/registration-seq.txt`). Point it to a persistent location, otherwise student numbers restart at `0001` after redeploys.
>
> Telegram configuration (`BotToken`, `WebhookUrl`/`WebhookSecret`, `MainChatId`, `ReceptionGroup`, `AdminIds`, `AdminKey`, reminder schedule) lives in the **.NET API** under the `Telegram:*` settings / environment variables. This app only uses `NEXT_PUBLIC_TG_BOT_USERNAME` (optional, defaults to `AEU_AdmissionsBot`) for the student Telegram link.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
