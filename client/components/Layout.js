import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex w-full max-w-6xl">
        <main className="w-full px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
