import "./globals.css";

export const metadata = {
  title: "TruCost.com",
  description: "Transparent booking search for real total costs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
