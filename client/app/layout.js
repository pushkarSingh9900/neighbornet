import "./globals.css";
import Layout from "../components/Layout";

export const metadata = {
  title: "NeighborNet",
  description: "Student housing reviews, issue reporting, messaging, and moderation for Lakehead students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <Layout>
          {children}
        </Layout>

      </body>
    </html>
  );
}
