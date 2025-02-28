import FunctionalPanel from "@/components/FunctionalPanel";
import ResultPanel from "@/components/ResultPanel";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden">
      <ResultPanel />
      <FunctionalPanel />
    </main>
  );
}
