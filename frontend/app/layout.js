import AuthProvider from "./components/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "FB Clone",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
