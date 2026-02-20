import "./globals.css";

export const metadata = {
  title: "Humanizer — Make AI Text Sound Human",
  description:
    "Rewrite AI-generated text into natural, human-sounding prose that bypasses AI detection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
