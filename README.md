# The Silent Archive

A minimal, brutalist blog platform built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Brutalist Design**: Strict monochrome palette, sharp borders, and bold typography.
- **Authentication**: Secure login via Email/Password, Google, and GitHub.
- **User Dashboard**: Manage your posts and view your profile.
- **Content Management**: Create, edit, and delete blog posts with Markdown support.
- **Responsive**: Fully optimized for all device sizes.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd blogs
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
    - `(auth)/`: Authentication routes (login, signup, callback).
    - `dashboard/`: User dashboard.
    - `posts/`: Post creation and editing.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and Supabase configuration.

## License

MIT
