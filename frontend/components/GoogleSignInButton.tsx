"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 250,
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      await loginWithGoogle(response.credential);
      onSuccess?.();
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      onError?.(error);
    }
  };

  return <div ref={buttonRef} className="flex justify-center" />;
}
