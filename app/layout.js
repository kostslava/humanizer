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
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
