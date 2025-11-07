export const metadata = {
  title: "Jaco Dog sitting Chatbot",
  description: "Jaco Dog sitting Chatbot",
};

import "../global.css";
import SessionProvider from "./components/SessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
