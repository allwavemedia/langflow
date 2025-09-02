# Component Placement Guidelines

This document outlines the conventions for directory structure and component placement within the Langflow Architect application. Adhering to these guidelines ensures consistency, maintainability, and ease of navigation.

## `src` Directory Structure

The `langflow-architect/app/src` directory is organized as follows:

-   **/app**: Contains page-level components and routing configurations for the Next.js App Router. Each subdirectory represents a route.
-   **/components**: Houses reusable UI components shared across the application.
-   **/hooks**: For custom React hooks that encapsulate and reuse stateful logic.
-   **/lib**: Includes utility functions, helper scripts, and libraries that are not specific to any single component.
-   **/features**: Contains implementations of specific application features, grouping components, hooks, and services by feature.
-   **/types**: Contains TypeScript type definitions, interfaces, and enums used throughout the project.

## Component Placement Rules

1.  **Reusable Components**: Any component that is used in more than one place or is intended for general use should be placed in `src/components`.
    -   **Example**: A custom `Button` or `Modal` component.

2.  **Feature-Specific Components**: For larger features, create a subdirectory within `src/components` to group related components.
    -   **Example**: `src/components/chat/` for chat-related components like `ChatInput` and `ChatMessage`.

3.  **Page-Level Components**: Components that represent an entire page or a unique section of a page should reside in `src/app`.
    -   **Example**: The main component for the `/dashboard` route would be in `src/app/dashboard/page.tsx`.

4.  **Stateful Logic**: Encapsulate stateful logic that needs to be shared between components into custom hooks in the `src/hooks` directory.

5.  **Client-Side Utilities**: General-purpose functions (e.g., date formatting, string manipulation) should be placed in `src/lib`.

6.  **API Interactions**: All code related to fetching data from or sending data to an API should be in `src/services`.

7.  **Type Definitions**: Shared TypeScript types and interfaces should be defined in `src/types`. For types only used within a single component, they can be co-located with that component's file.
