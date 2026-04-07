import Navbar from "./Navbar";
import ModerationBanner from "./ModerationBanner";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ModerationBanner />

      <div className="mx-auto flex w-full max-w-7xl">
        <main className="w-full px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
