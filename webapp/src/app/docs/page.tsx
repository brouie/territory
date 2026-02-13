import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Docs | Territory",
  description: "How to play Territory - onchain strategy game on opBNB",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between bg-[#0d1117]">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/logo-transparent.png"
            alt="Territory"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="font-mono text-lg font-bold text-[#39c5cf]">Territory</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          Back to game
        </Link>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-12 text-[#e6edf3]">
        <h1 className="font-mono text-3xl font-bold text-[#e6edf3] mb-2">
          What is Territory?
        </h1>
        <p className="text-[#8b949e] mb-8">
          Onchain strategy GameFi on opBNB. Capture map locations, fight PVE or other players.
          Fully deterministic, no RNG. Outcomes depend on your decisions.
        </p>

        <h2 className="font-mono text-xl font-semibold text-[#39c5cf] mt-10 mb-4">
          How to Play
        </h2>
        <p className="text-[#8b949e] mb-4">
          Connect MetaMask on opBNB Testnet (chain 5611). You need tBNB for fees and Gold in your wallet.
        </p>
        <ol className="list-decimal list-inside space-y-3 text-[#8b949e] mb-8">
          <li><strong className="text-[#e6edf3]">Approve</strong> – Allow the game to spend your Gold</li>
          <li><strong className="text-[#e6edf3]">Deposit</strong> – Move Gold into escrow (for spawning)</li>
          <li><strong className="text-[#e6edf3]">Spawn</strong> – Create units at a location (1 Gold per unit)</li>
          <li><strong className="text-[#e6edf3]">Move</strong> – Go to adjacent locations (1-2, 1-3, 2-3, 2-4, 3-4)</li>
          <li><strong className="text-[#e6edf3]">Fortify</strong> – Defend locations you own by deploying units there</li>
          <li><strong className="text-[#e6edf3]">Attack</strong> – Capture PVE or PVP locations (min 25 units)</li>
        </ol>

        <h2 className="font-mono text-xl font-semibold text-[#39c5cf] mt-10 mb-4">
          Combat
        </h2>
        <p className="text-[#8b949e] mb-4">
          Power = level × units. You need more power than the defender to win. Defender wins ties.
        </p>
        <ul className="list-disc list-inside space-y-2 text-[#8b949e] mb-8">
          <li><strong className="text-[#e6edf3]">PVE</strong> – Unowned locations have fixed base power (e.g. location 1 = 50)</li>
          <li><strong className="text-[#e6edf3]">PVP</strong> – Defended by units the owner fortified there</li>
        </ul>

        <h2 className="font-mono text-xl font-semibold text-[#39c5cf] mt-10 mb-4">
          Fees
        </h2>
        <table className="w-full text-[#8b949e] mb-8 border border-[#21262d] rounded overflow-hidden">
          <thead>
            <tr className="bg-[#161b22]">
              <th className="text-left px-4 py-2 font-mono text-[#e6edf3]">Action</th>
              <th className="text-left px-4 py-2 font-mono text-[#e6edf3]">Fee</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#21262d]">
              <td className="px-4 py-2">Move</td>
              <td className="px-4 py-2">0.00001 tBNB</td>
            </tr>
            <tr className="border-t border-[#21262d]">
              <td className="px-4 py-2">Spawn</td>
              <td className="px-4 py-2">0.00001 tBNB</td>
            </tr>
            <tr className="border-t border-[#21262d]">
              <td className="px-4 py-2">Attack</td>
              <td className="px-4 py-2">0.00005 tBNB</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[#8b949e] mb-8 text-sm">
          70% treasury, 30% CL8Y buy-and-burn. Payouts (treasury rewards, PVP bounties) planned for mainnet.
        </p>

        <h2 className="font-mono text-xl font-semibold text-[#39c5cf] mt-10 mb-4">
          Links
        </h2>
        <ul className="space-y-2 text-[#39c5cf]">
          <li>
            <a href="https://github.com/brouie/territory" target="_blank" rel="noopener noreferrer" className="hover:underline">
              GitHub
            </a>
          </li>
          <li>
            <a href="https://opbnb-testnet.bscscan.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              opBNB Testnet Explorer
            </a>
          </li>
        </ul>

        <div className="mt-16 pt-8 border-t border-[#21262d]">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#39c5cf] text-[#0a0e14] font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Play Territory
          </Link>
        </div>
      </article>
    </div>
  );
}
