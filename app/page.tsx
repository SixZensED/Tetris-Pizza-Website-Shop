import { TopBar } from "./components/topbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-black text-neutral-900">Welcome to the Home Page</h1>
        <p className="mt-4 text-lg text-neutral-700">
          This is the main landing page of the application.
        </p>
        <p className="mt-2 text-lg text-neutral-700">
          Explore our features and enjoy your stay!
        </p>
      </main>
    </div>
  );
}
