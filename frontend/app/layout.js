import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Clareia",
  description: "Correção de questões discursivas com apoio de IA para professores.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
