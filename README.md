<p align="center">
  <a href="https://status-checker-omega.vercel.app/generator/og" target="blank"><img src="https://status-checker-omega.vercel.app/api/og/rVRbb9MwFP4rVVAlkJrUubeVEAK2wR5gEvQNIeQ4J4k3JzaO07SM8ts5brusHePygNSqPd85Prfvs28dJnNwFreO2Sj8dXK-ciaO0lK1Fm3NRuzcFfCyMhjgEzLGiJ7npro3c94qQTcIFALWCNifM66BGS4bhJkUXd2ggwpeNpcGaszvMGgMaESvu9bwYvNaot3YMoOnQOgj_4ZNzGcTm0ZqdPcVN-BsEai4yDVgiU_DDLwuT2bQDMHKGNUuptPWUNO1LquA3YB2ZQ0l9VagGQiPKjWlik9lOeU1LcHFHOvNi06L57vj4_DlOLjAD1bwCg2g-I3HZI2ItdwVjis1WjRrjabMuBltGqySUXZTatk1udtzU7mD30glS01VtXFzaHEzX3wSzVw_IGHgXatyHF6YcXjWmnEQh2d-GodJFKTh7Aes1RGUhAhVNWU7LImLOM5nkCYpxCSYz_2YJZnPgoikBAI2C4gfU59GjKZ-DkUcElZk0SwMC0aiFJMkPRbFJgjucZCAki0_sIn9I5_IwMTBCZwFmTgCCuQN_zxQxkPhFFxYYhdOJjr9NFbrZ6c0Np0Q2-1kILNdnZL5f7uRijJuULfEIzH2seLQv5JrDCAjMsIF2C_GrWvRWMFaGaCI-r73-tCTupyin0z3TT6mxcO4RxPwHOFG8hYu7nz3B-_PwbLTWSegYXau4fSd26qHivc2Dbozitk0fO0w3F7CCLGmq68wZgW272BHJDesWnKxQ_bWSfH96o-Xb-_vcfV_5RZvzNMnRzM-e6TO5z-wfFcnmM0RPiUljUdJvC8mEHpSFMWxSmuqS25VYSPV-lRcQz1FMf9RQcvJuzD14rkXxCJMvDlWid56SbQ33CT69pdd_e7l3De0tMKMyEk3ztWb72_O359_eLm8-uDsN4KKtKrepbBPH_5BMTW0tiWWmvJmdNVYyg_5UUm6psK-yAcyIoJVhiOXh2f0zpsSvBQPzh6Fv6MYzqkYXTLbxEnWX899Hu6XfSvu9ZCEaOSQdaWzKKhoYeJALa_5cr8p0--sw-N-XmeA6ze6g-32Jw.png" alt="OG Generator Preview" /></a>
</p>

# Status Checker | OG Generator

[![Activity scheduler](https://github.com/EduardStroescu/next-status-checker/actions/workflows/supabase-cron-job.yml/badge.svg)](https://github.com/EduardStroescu/next-status-checker/actions/workflows/supabase-cron-job.yml)

## Introduction

A lightweight project status checker and dynamic image generation tool for developers and teams. It monitors the health of various services—including client-side apps, API backends, and Supabase databases—while also offering a powerful system for generating custom Open Graph (OG) and other image types using HTML, CSS, Tailwind, and satori.

Whether you're keeping tabs on uptime or creating rich visual previews, this project combines monitoring and real-time image generation in a single, extensible platform.

## Overview

This project serves two primary purposes:

Status Monitoring:

- Monitors the status of various project types: client apps, APIs, Supabase databases, etc.
- Designed for fast, periodic checks to display current and past availability.
- Easily configurable to add or remove services based on your needs.

Dynamic Image Generation:

- Includes a live editor route that allows you to write HTML with CSS or Tailwind to build image templates.
- Real-time preview updates as you edit, providing instant feedback on your design.
- An API route lets you export and serve the generated images (e.g. Open Graph images for social sharing).
- Built with satori and @vercel/og, offering fast and high-quality rendering.

This tool is especially useful for developers looking to track project uptime or to generate social media-ready image generation for their own projects.

### Features

- ⚡ Built with Next.js 15 App Router — Utilizes the latest features of Next.js including server components and enhanced routing.
- 🖼️ Open Graph Image Generator with Live Editor — Generate OG and custom images using HTML, CSS, or Tailwind with real-time preview.
- 🔓 Public Access with Watermark — Unauthenticated users can generate images with a default watermark applied.
- 🧑‍💻 Watermark-Free for Registered Users — Authenticated users get access to clean, watermark-free exports.
- 🔐 Custom Authentication — Lightweight and secure authentication system tailored for your use case.
- 🚀 Optimistic UI Updates — Seamless interactions with real-time feedback and low-latency feel.
- 📱 Responsive Design — Works across all screen sizes, from mobile to desktop.
- 🎬 View Transitions API Support — Smooth page transitions using the modern View Transitions API.
- 🛡️ Fully Typed with TypeScript — Type-safe codebase for better developer experience and reliability.

### Technologies Used

- 🖼️ [`@vercel/satori`](https://github.com/vercel/satori) – Core SVG/OG rendering engine
- ⚙️ [`@vercel/og`](https://vercel.com/docs/og-image-generation/og-image-api) – Dynamic OG image API
- 🧠 [`react-live`](https://github.com/FormidableLabs/react-live) – Live code editing and preview
- 🧑‍💻 [`monaco-editor`](https://github.com/suren-atoyan/monaco-react) – Code editor with full HTML/CSS support
- 🔄 [`TanStack Query`](https://tanstack.com/query/latest/docs/framework/react/overview) – Async data fetching and cache management
- 🧰 [`Supabase`](https://github.com/supabase/supabase) – Interact with Supabase databases and extract their status
- 🧱 [`Drizzle ORM`](https://github.com/drizzle-team/drizzle-orm) – Type-safe SQL queries
- 🎨 [`Tailwind CSS`](https://tailwindcss.com/) – Utility-first styling
- 🧩 [`Shadcn UI`](https://github.com/shadcn-ui/ui) – Accessible UI components
- 🧾 [`React Hook Form`](https://github.com/react-hook-form/react-hook-form) – Form handling
- ✅ [`Zod`](https://github.com/colinhacks/zod) – Schema validation
- 🔑 [`Jose`](https://github.com/panva/jose) – JWT and token management
- 🔐 [`Bcrypt`](https://github.com/kelektiv/node.bcrypt.js) – Password hashing
- 🔁 [`UUID`](https://github.com/uuidjs/uuid) – Unique ID generation
- 📏 **ESLint** – Code linting and formatting

```
Remember to update `.env` with your Singlestore keys, website URL, NextAuth secret and Signup status!

Example:
_Provided by Singlestore_
SINGLESTORE_USER=
SINGLESTORE_PASS=
SINGLESTORE_HOST=
SINGLESTORE_PORT=3333
SINGLESTORE_DB_NAME=

NEXTAUTH_SECRET="plsHire"

NEXT_PUBLIC_URL="http://localhost:3000" || Production URL
NEXT_PUBLIC_SIGNUP_CLOSED=true - Close signup
```

## Local development

```bash
git clone https://github.com/EduardStroescu/next-status-checker.git
npm install
npm run dev
```

## Building for production

```bash
npm run build
```
