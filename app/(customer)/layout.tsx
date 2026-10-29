import { BottomNav } from "@/components/layout/BottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen bg-[#F8F9FA] pb-24 w-full">
      {children}
      <BottomNav />
    </div>
  );
}
