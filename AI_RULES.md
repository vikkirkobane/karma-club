# 🤖 AI Rules & Tech Stack Guidelines for Karma Club

This document outlines the core technologies used in the Karma Club application and provides clear rules for when and how to use specific libraries. Adhering to these guidelines ensures consistency, maintainability, and optimal performance.

## 🚀 Tech Stack Overview

The Karma Club application is built with a modern and robust technology stack:

*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static type definitions, enhancing code quality and developer experience.
*   **Vite**: A next-generation frontend tooling that provides an extremely fast development server and optimized build process.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built on Radix UI and styled with Tailwind CSS.
*   **Radix UI**: A low-level, unstyled component library that provides accessible primitives for building robust UI components.
*   **React Router**: A standard library for client-side routing in React applications, managing navigation between different views.
*   **Supabase**: An open-source Firebase alternative providing a PostgreSQL database, authentication, real-time subscriptions, and storage.
*   **Cloudinary**: A cloud-based service for managing, optimizing, and delivering images and videos.
*   **React Query (TanStack Query)**: A powerful library for managing server-side state, including data fetching, caching, synchronization, and error handling.
*   **Lucide React**: A collection of beautiful and customizable SVG icons for React applications.
*   **Vite PWA**: A plugin that integrates Progressive Web App (PWA) capabilities, enabling offline support and installability.
*   **Sonner**: A modern, accessible, and customizable toast notification library.

## 📚 Library Usage Rules

To maintain a consistent and efficient codebase, please follow these rules when using libraries:

*   **UI Components**:
    *   **Primary Choice**: Always use components from `shadcn/ui` (`src/components/ui/`).
    *   **Custom Components**: If a specific `shadcn/ui` component is not available or requires significant modification, create a new component in `src/components/` using `Radix UI` primitives and `Tailwind CSS`. **Do not modify `shadcn/ui` source files directly.**
*   **Styling**:
    *   **Exclusive Use**: All styling must be done using `Tailwind CSS` classes. Avoid inline styles or custom CSS files (except for `src/index.css` for global base styles).
    *   **Responsive Design**: Always prioritize responsive design using Tailwind's utility classes.
*   **Icons**:
    *   **Standard**: Use icons from `lucide-react` for all visual representations.
*   **Routing**:
    *   **Library**: Use `react-router-dom` for all client-side navigation.
    *   **Route Definition**: All main application routes should be defined in `src/App.tsx`.
*   **State Management (Server State)**:
    *   **Data Fetching/Caching**: Use `React Query` (`@tanstack/react-query`) for fetching, caching, and synchronizing all server-side data (e.g., user profiles, activities, leaderboard, community posts).
*   **State Management (Client State)**:
    *   **Local State**: Use React's `useState` and `useReducer` for component-specific state.
    *   **Global State**: Use React's `useContext` for global client-side state (e.g., `AuthContext`, `UserStatsContext`).
*   **Authentication, Database & Real-time**:
    *   **Backend Interaction**: Use the `Supabase` client (`@supabase/supabase-js`) for all backend operations, including user authentication, database CRUD operations, and real-time subscriptions.
    *   **Database Functions**: Utilize PostgreSQL functions (RPC calls) for complex or atomic database operations when available (e.g., `toggle_post_like`).
*   **Media Upload & Storage**:
    *   **Service**: Use `CloudinaryService` (from `src/lib/cloudinary.ts`) for all image and video uploads. Ensure Cloudinary is properly configured with unsigned upload presets.
*   **Toast Notifications**:
    *   **Library**: Use `sonner` for displaying user feedback and notifications. The `use-toast` hook from `shadcn/ui` is also available for more traditional toasts.
*   **Forms**:
    *   **Validation**: For complex forms, use `react-hook-form` in conjunction with `zod` for schema validation.
*   **Date Handling**:
    *   **Formatting**: Use `date-fns` for consistent date formatting and manipulation.
*   **Utility Functions**:
    *   **General Utilities**: Place general helper functions in `src/lib/utils.ts`.
    *   **Performance Utilities**: Place performance-related hooks and helpers (e.g., `useDebounce`, `optimizeImageUrl`) in `src/lib/performance.ts`.
*   **Offline/PWA**:
    *   **Functionality**: The `vite-plugin-pwa` is configured for PWA features. The `useOfflineQueue` hook (`src/hooks/useOfflineQueue.ts`) should be used for actions that need to be queued and retried when the user is offline.

By following these rules, we ensure a cohesive, high-quality, and easily maintainable application.