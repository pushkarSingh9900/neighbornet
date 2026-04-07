import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl">
        <main className="w-full px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
