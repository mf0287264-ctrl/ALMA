# ALMA Frontend — Architecture & Team Guidelines

Welcome to the **ALMA** frontend application! This project is built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

This guide outlines our project architecture, folder conventions, and coding patterns so our team can collaborate seamlessly.

---

## 1. Directory Structure

```text
alma_frontend/
├── public/                       # Static public assets (favicons, public SVGs)
├── src/
│   ├── app/                      # Next.js App Router (All routing lives here)
│   │   ├── (auth)/               # Route Group for Authentication (URLs do NOT include "/(auth)")
│   │   │   ├── login/
│   │   │   │   ├── loading.tsx   # Loading spinner for login route
│   │   │   │   ├── login.action.ts # Colocated server action
│   │   │   │   ├── login.schema.ts # Colocated Zod validation schema
│   │   │   │   └── page.tsx      # Login page route (/login)
│   │   │   └── register/
│   │   │       ├── loading.tsx   # Loading spinner for register route
│   │   │       ├── register.action.ts # Colocated server action
│   │   │       ├── register.schema.ts # Colocated Zod validation schema
│   │   │       └── page.tsx      # Register page route (/register)
│   │   │
│   │   ├── api/                  # API Route Handlers
│   │   │   └── auth/[...nextauth]/
│   │   │       └── route.ts      # NextAuth authentication endpoint
│   │   │
│   │   ├── _action/              # Global Server Actions ("use server")
│   │   │
│   │   ├── _components/          # Project-specific feature components (Navbar, Header, etc.)
│   │   │
│   │   ├── _Context/             # React Context Providers for global client state
│   │   │
│   │   ├── _providers/           # Root client wrapper providers (e.g. SessionProvider)
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css           # Tailwind v4 theme & global styles
│   │   ├── layout.tsx            # Root application layout
│   │   ├── loading.tsx           # Global fallback loading spinner
│   │   ├── not-found.tsx         # 404 page
│   │   └── page.tsx              # Home page route (/)
│   │
│   ├── assts/                    # Local assets
│   │   └── images/               # Images (PNG, JPG, WebP, SVG) imported via @/images/*
│   │
│   ├── components/
│   │   └── ui/                   # Reusable UI component primitives (Shadcn UI)
│   │
│   ├── lib/                      # Core configs & helpers (nextauth.config.ts, utils.ts)
│   │
│   ├── services/                 # Server-side data fetching functions (GET external APIs)
│   │
│   ├── types/                    # Centralized TypeScript declarations & interfaces (*.type.ts)
│   │
│   ├── utils/                    # Shared utility helper functions (token decoders, formatters)
│   │
│   └── proxy.ts                  # Middleware / route protection helper
│
├── components.json               # Shadcn UI configuration
├── next.config.ts                # Next.js compiler & configuration
├── package.json                  # Dependencies & scripts
├── postcss.config.mjs            # PostCSS configuration for Tailwind CSS v4
└── tsconfig.json                 # TypeScript configuration & path aliases (@/*, @/images/*)
```

---

## 2. Where Do Pages Go? (`src/app/`)

Next.js uses **file-system based routing** inside `src/app/`:

1. **Creating a Page**:
   - Every route is a folder containing a `page.tsx` file.
   - Example: `src/app/dashboard/page.tsx` maps to `/dashboard`.
   - The root `src/app/page.tsx` maps to the home page (`/`).

2. **Route Groups `(auth)`**:
   - Parentheses around a folder name like `(auth)` organize routes logically without affecting the URL.
   - Example: `src/app/(auth)/login/page.tsx` renders at `/login`, **not** `/(auth)/login`.

3. **Loading States (`loading.tsx`)**:
   - Each route can define a `loading.tsx` file that Next.js automatically renders inside a React Suspense boundary while data is loading.

4. **Dynamic Routes (`[id]/page.tsx`)**:
   - Folders named `[id]` capture dynamic URL parameters.
   - **Important in Next.js 16:** `params` is asynchronous! Always await `params`:
     ```tsx
     interface Props {
       params: Promise<{ id: string }>;
     }

     export default async function Page({ params }: Props) {
       const { id } = await params;
       return <div>ID: {id}</div>;
     }
     ```

---

## 3. Components: `_components/` vs `components/ui/`

We separate custom feature components from reusable UI primitives:

### `src/app/_components/` (Feature Components)
- Put custom, application-specific components here (e.g., `NavBar.tsx`, `Footer.tsx`, `Sidebar.tsx`, `StudentCard.tsx`).
- Prefixed with an underscore `_` so Next.js App Router ignores it as a route.

### `src/components/ui/` (UI Library Primitives - Shadcn UI)
- Put generic, headless/accessible UI primitives here (e.g., Button, Dialog, Dropdown, Input, Card).
- This directory is configured with **Shadcn UI** (`components.json`).
- When you need a component, simply install it using the Shadcn CLI:
  ```bash
  npx shadcn@latest add button
  npx shadcn@latest add dialog
  npx shadcn@latest add input
  ```
- The component source code will be added directly into `src/components/ui/`.

---

## 4. API Calling: `services/` vs `_action/`

Both directories communicate with APIs, but they serve two distinct purposes:

| Feature | `src/services/` | `src/app/_action/` |
| :--- | :--- | :--- |
| **Execution Context** | **Server-Side Render (SSR / RSC)** | **Client Interactions / Mutations** |
| **Primary Use Case** | Fetching data (`GET`) to render pages | Submitting forms, mutations (`POST`, `PUT`, `DELETE`) |
| **Called From** | Server Components (`page.tsx`) before render | Client Components on user events (clicks, form submit) |
| **Directive** | Standard async functions | Requires `"use server";` at top of file/function |
| **Caching** | Caches with `fetch(..., { next: { revalidate } })` | Usually revalidates paths (`revalidatePath()`) |

### Example 1: `src/services/` (Server Data Fetching)
Used inside `page.tsx` (Server Component) to fetch data on the server before sending HTML to the client:
```ts
// src/services/getLessons.ts
export async function getLessons() {
  const res = await fetch("https://api.example.com/lessons", {
    cache: "force-cache",
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) throw new Error("Failed to fetch lessons");
  return res.json();
}
```

### Example 2: `src/app/_action/` (Server Action / Client Mutation)
Used when a user clicks a button or submits a form in a Client Component:
```ts
// src/app/_action/submitAssignment.action.ts
"use server";

import { getMyToken } from "@/utils/getMyToken";

export async function submitAssignment(assignmentId: string, solution: string) {
  const token = await getMyToken();
  const res = await fetch(`https://api.example.com/assignments/${assignmentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ solution }),
  });
  return res.json();
}
```

---

## 5. Types (`src/types/`)

- Contains all **centralized TypeScript interfaces, types, and enums**.
- Keep types decoupled from components so they can be reused across pages, services, actions, and contexts.
- Naming convention: `<Entity>.type.ts` (e.g., `User.type.ts`, `Course.type.ts`, `Lesson.type.ts`).
- Example:
  ```ts
  // src/types/User.type.ts
  export interface UserType {
    _id: string;
    name: string;
    email: string;
    role: "student" | "instructor" | "admin";
  }
  ```

---

## 6. Utilities (`src/utils/`)

- Contains **pure, reusable helper functions** that can be shared across the project.
- Examples of what to put here:
  - Auth token extraction (`getMyToken.ts`, `getUserId.ts`, `getUserRole.ts`).
  - Date formatters (e.g., `formatRelativeTime(date)`).
  - String formatting or currency converters.
  - Cookie helpers.

---

## 7. Form Validation Schemas (`*.schema.ts`)

- We use **Zod** for schema validation.
- Every form or input payload should have a dedicated schema file (colocated with the route or in a shared schemas directory):
  - Example: `src/app/(auth)/login/login.schema.ts`
- Always export both the Zod schema and the inferred TypeScript type:
  ```ts
  // src/app/(auth)/login/login.schema.ts
  import * as z from "zod";

  export const logInSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  export type LoginInputType = z.infer<typeof logInSchema>;
  ```

---

## 8. Assets & Images (`src/assts/images/`)

- Place all local static image files (PNG, JPG, WebP, SVG) inside `src/assts/images/`.
- Use the configured `@/images/*` path alias:
  ```tsx
  import logo from "@/images/logo.png";

  <img src={logo.src} alt="ALMA Logo" />
  ```

---

## 9. Context & Providers (`_Context/` & `_providers/`)

- `src/app/_Context/`: Place React Contexts managing global client-side state here (e.g., `ThemeContext.tsx`, `UserContext.tsx`).
- `src/app/_providers/`: Place root-level wrapper providers here (e.g., `AuthProviders.tsx` wrapping `SessionProvider`), which are rendered inside `src/app/layout.tsx`.

---

## 10. Path Aliases Reference

Configured in `tsconfig.json`:
- `@/*` $\rightarrow$ points to `./src/*` (e.g. `import { cn } from "@/lib/utils"`)
- `@/images/*` $\rightarrow$ points to `./src/assts/images/*` (e.g. `import hero from "@/images/hero.png"`)

---

## 11. Scripts

```bash
# Run local dev server with Turbopack
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Create optimized production build
npm run build

# Start production server
npm start
```
