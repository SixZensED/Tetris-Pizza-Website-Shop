import { TopBar } from "./components/topbar";
import { OrderTypeSection } from "./components/order-type-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 pt-4 pb-16">
        <OrderTypeSection />
      </main>
    </div>
  );
}
