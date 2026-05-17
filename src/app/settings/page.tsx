import Link from "next/link";
import { QRSection } from "./QRSection";

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-gray-400">
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold">設定</h1>
        </div>

        <section>
          <h2 className="mb-2 font-semibold">QR コード</h2>
          <p className="mb-6 text-sm text-gray-500">
            このQRコードを餌場の近くに貼ってください。読み込むと給餌記録画面が開きます。
          </p>
          <QRSection />
        </section>
      </div>
    </main>
  );
}
