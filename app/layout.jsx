import "./globals.css";

export const metadata = {
  title: "Product Map MVP",
  description: "Product Map MVP UI"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
