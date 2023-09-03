import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "anonshare",
    description: "Anonymously share files",
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} flex justify-center items-center h-screen`}
            >
                {children}
            </body>
        </html>
    )
}
