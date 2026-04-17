"use client";

import { Toaster } from "sonner";

export function ToasterClient() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme="system"
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
