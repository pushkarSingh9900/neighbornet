import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div>

      <Navbar />

      <div className="flex">

        <main className="p-8 w-full">
          {children}
        </main>

      </div>

    </div>
  );
}