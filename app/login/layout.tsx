import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Login | IHS-ERP",
    description: "Sign in to your IHS-ERP account",
}

/**
 * Login Layout
 * 
 * Simple layout for authentication pages.
 * No sidebar or header - just centered content.
 */
export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
