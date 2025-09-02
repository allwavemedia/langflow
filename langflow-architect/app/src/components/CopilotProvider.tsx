"use client";

import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { useState, useEffect } from "react";

interface CopilotProviderProps {
  children: React.ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only rendering for CopilotKit components
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render CopilotKit components during SSR to avoid hydration issues
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}
