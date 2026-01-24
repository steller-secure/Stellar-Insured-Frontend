import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";

export default function ClaimsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />

            {/* Main Content Area */}
            <div className="ml-72 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 px-8 backdrop-blur-md">
                    <h1 className="text-xl font-bold text-white">
                        {/* Dynamic Header could go here */}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button variant="primary" size="sm" className="font-semibold">
                            Connect Wallet
                        </Button>

                    </div>
                </header>

                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
