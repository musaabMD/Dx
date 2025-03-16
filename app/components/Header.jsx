import Link from "next/link";
import config from "@/config";

export default function Header() {
  return (
    <header className="p-4 border-b">
      <div className="container mx-auto">
        <Link href="/" className="text-xl font-bold">
          {config.appName}
        </Link>
      </div>
    </header>
  );
} 