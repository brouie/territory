import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Docs | Territory",
  description: "How to play Territory - onchain strategy game on opBNB",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-mono text-xl font-semibold text-[#39c5cf] mt-10 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-4 border border-[#21262d] rounded-lg bg-[#161b22]">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#39c5cf] text-[#0a0e14] font-mono font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-mono font-semibold text-[#e6edf3] mb-1">{title}</h4>
        <p className="text-sm text-[#8b949e]">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-[#21262d] rounded-lg overflow-hidden">
      <summary className="px-4 py-3 cursor-pointer bg-[#161b22] hover:bg-[#21262d] transition-colors font-mono text-[#e6edf3] flex items-center justify-between">
        {question}
        <span className="text-[#6e7681] group-open:rotate-180 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <div className="px-4 py-3 text-sm text-[#8b949e] border-t border-[#21262d]">
        {answer}
      </div>
    </details>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between bg-[#0d1117] sticky top-0 z-10">
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

      <div className="max-w-4xl mx-auto px-6 py-12 text-[#e6edf3]">
        {/* Navigation */}
        <nav className="mb-12 p-4 border border-[#21262d] rounded-lg bg-[#161b22]">
          <p className="text-xs text-[#6e7681] mb-2 font-mono">QUICK LINKS</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "#getting-started", label: "Getting Started" },
              { href: "#how-to-play", label: "How to Play" },
              { href: "#map", label: "Map & Movement" },
              { href: "#combat", label: "Combat" },
              { href: "#fees", label: "Fees" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1 text-sm border border-[#30363d] rounded hover:border-[#39c5cf] hover:text-[#39c5cf] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Hero */}
        <h1 className="font-mono text-3xl font-bold text-[#e6edf3] mb-2">
          What is Territory?
        </h1>
        <p className="text-[#8b949e] mb-8 text-lg">
          Onchain strategy GameFi on opBNB. Capture map locations, fight PVE or other players.
          Fully deterministic, no RNG. Outcomes depend on your decisions, not luck.
        </p>

        {/* Getting Started */}
        <Section id="getting-started" title="Getting Started">
          <p className="text-[#8b949e] mb-6">
            Follow these steps to start playing on opBNB Testnet. You will need MetaMask (or any Web3 wallet).
          </p>
          
          <div className="space-y-4 mb-8">
            <StepCard 
              number={1} 
              title="Add opBNB Testnet to MetaMask"
              description="Network Name: opBNB Testnet | RPC: https://opbnb-testnet-rpc.bnbchain.org | Chain ID: 5611 | Symbol: tBNB | Explorer: https://opbnb-testnet.bscscan.com"
            />
            <StepCard 
              number={2} 
              title="Get tBNB (Test BNB)"
              description="Visit the BNB Chain Testnet Faucet at https://www.bnbchain.org/en/testnet-faucet to get free tBNB for transaction fees."
            />
            <StepCard 
              number={3} 
              title="Get Gold Tokens"
              description="On testnet, the deployer receives Gold. Ask in the community for some testnet Gold, or deploy your own contracts for testing."
            />
            <StepCard 
              number={4} 
              title="Connect Your Wallet"
              description="Click 'Connect Wallet' on Territory. Make sure you're on opBNB Testnet (chain 5611)."
            />
          </div>

          <div className="p-4 border border-amber-900/50 bg-amber-950/20 rounded-lg">
            <p className="text-amber-400 text-sm font-mono mb-1">Important</p>
            <p className="text-[#8b949e] text-sm">
              Always keep some tBNB in your wallet for transaction fees. Each action (move, spawn, attack) requires a small fee.
            </p>
          </div>
        </Section>

        {/* How to Play */}
        <Section id="how-to-play" title="How to Play">
          <p className="text-[#8b949e] mb-4">
            The game follows a simple flow. Complete these actions in order:
          </p>
          <ol className="list-decimal list-inside space-y-4 text-[#8b949e] mb-8">
            <li>
              <strong className="text-[#e6edf3]">Approve</strong> - Allow the game contract to spend your Gold tokens. This is a one-time approval.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Deposit</strong> - Move Gold from your wallet into the game escrow. This Gold is used for spawning units.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Spawn</strong> - Create units at any location. Costs 1 Gold per unit. You need units to attack and fortify.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Move</strong> - Travel between adjacent locations on the map. You can only attack locations you can reach.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Fortify</strong> - After capturing a location, deploy units there to defend it from other players (PVP).
            </li>
            <li>
              <strong className="text-[#e6edf3]">Attack</strong> - Capture unowned locations (PVE) or take over locations owned by other players (PVP). Minimum 25 units required.
            </li>
          </ol>
        </Section>

        {/* Map */}
        <Section id="map" title="Map & Movement">
          <p className="text-[#8b949e] mb-4">
            The map consists of 4 locations connected by paths. You can only move between adjacent (connected) locations.
          </p>
          
          <div className="p-6 border border-[#21262d] rounded-lg bg-[#161b22] mb-6">
            <p className="font-mono text-[#e6edf3] mb-4 text-center">Map Layout</p>
            <pre className="text-[#8b949e] text-center font-mono text-sm leading-relaxed">
{`       [1]
      /   \\
    [2]---[3]
      \\   /
       [4]`}
            </pre>
          </div>

          <div className="mb-6">
            <p className="font-mono text-sm text-[#e6edf3] mb-2">Adjacent Connections:</p>
            <ul className="grid grid-cols-2 gap-2 text-sm text-[#8b949e]">
              <li className="flex items-center gap-2">
                <span className="text-[#39c5cf]">1</span> connects to <span className="text-[#39c5cf]">2, 3</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#39c5cf]">2</span> connects to <span className="text-[#39c5cf]">1, 3, 4</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#39c5cf]">3</span> connects to <span className="text-[#39c5cf]">1, 2, 4</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#39c5cf]">4</span> connects to <span className="text-[#39c5cf]">2, 3</span>
              </li>
            </ul>
          </div>

          <p className="text-[#8b949e] text-sm">
            <strong className="text-[#e6edf3]">Note:</strong> You cannot skip locations. To go from 1 to 4, you must first move to 2 or 3.
          </p>
        </Section>

        {/* Combat */}
        <Section id="combat" title="Combat">
          <p className="text-[#8b949e] mb-4">
            Combat is fully deterministic. No luck involved - outcomes are calculated using a simple formula.
          </p>

          <div className="p-4 border border-[#39c5cf]/30 bg-[#39c5cf]/5 rounded-lg mb-6">
            <p className="font-mono text-[#39c5cf] text-center text-lg">
              Power = Level x Units
            </p>
            <p className="text-[#8b949e] text-sm text-center mt-2">
              Example: 100 Level-1 units = 100 power
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-[#21262d] rounded-lg">
              <h4 className="font-mono text-[#e6edf3] mb-2">PVE (vs Environment)</h4>
              <ul className="text-sm text-[#8b949e] space-y-1">
                <li>Unowned locations have fixed base power</li>
                <li>Your power must exceed base power to win</li>
                <li>Win: You capture the location</li>
                <li>Lose: Your attacking units are burned</li>
              </ul>
            </div>
            <div className="p-4 border border-[#21262d] rounded-lg">
              <h4 className="font-mono text-[#e6edf3] mb-2">PVP (vs Players)</h4>
              <ul className="text-sm text-[#8b949e] space-y-1">
                <li>Player-owned locations defended by fortified units</li>
                <li>Defender wins ties</li>
                <li>Win: Capture location, defender loses all units</li>
                <li>Lose: You lose all attacking units</li>
              </ul>
            </div>
          </div>

          <div className="p-4 border border-[#21262d] rounded-lg bg-[#161b22]">
            <p className="font-mono text-sm text-[#e6edf3] mb-2">Loss Calculation</p>
            <p className="text-sm text-[#8b949e]">
              When the attacker wins, attacker losses = (defender power x attacker units) / attacker power. 
              The defender loses all deployed units. When the defender wins, the attacker loses everything; 
              the defender loses a proportional amount.
            </p>
          </div>
        </Section>

        {/* Fees */}
        <Section id="fees" title="Fees">
          <p className="text-[#8b949e] mb-4">
            Each action requires a small fee in tBNB (BNB on testnet). Fees support the protocol and CL8Y ecosystem.
          </p>

          <table className="w-full text-[#8b949e] mb-6 border border-[#21262d] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#161b22]">
                <th className="text-left px-4 py-3 font-mono text-[#e6edf3]">Action</th>
                <th className="text-left px-4 py-3 font-mono text-[#e6edf3]">Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#21262d]">
                <td className="px-4 py-3">Move</td>
                <td className="px-4 py-3 font-mono">0.00001 tBNB</td>
              </tr>
              <tr className="border-t border-[#21262d]">
                <td className="px-4 py-3">Spawn</td>
                <td className="px-4 py-3 font-mono">0.00001 tBNB</td>
              </tr>
              <tr className="border-t border-[#21262d]">
                <td className="px-4 py-3">Attack</td>
                <td className="px-4 py-3 font-mono">0.00005 tBNB</td>
              </tr>
            </tbody>
          </table>

          <div className="p-4 border border-[#21262d] rounded-lg bg-[#161b22]">
            <p className="font-mono text-sm text-[#e6edf3] mb-2">Fee Distribution</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-mono text-[#39c5cf]">60%</p>
                <p className="text-xs text-[#8b949e]">Protocol Treasury</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-[#39c5cf]">10%</p>
                <p className="text-xs text-[#8b949e]">DAO Treasury</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-[#39c5cf]">30%</p>
                <p className="text-xs text-[#8b949e]">CL8Y Buy & Burn</p>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" title="Frequently Asked Questions">
          <div className="space-y-3">
            <FAQItem 
              question="Why do I see 'Wrong network' error?"
              answer="You need to switch to opBNB Testnet (Chain ID: 5611) in your wallet. Click the network selector in MetaMask and choose opBNB Testnet, or add it manually using the RPC URL: https://opbnb-testnet-rpc.bnbchain.org"
            />
            <FAQItem 
              question="Where do I get tBNB for fees?"
              answer="Visit the BNB Chain Testnet Faucet at https://www.bnbchain.org/en/testnet-faucet - Enter your wallet address and request tBNB. It may take a few minutes to arrive."
            />
            <FAQItem 
              question="Where do I get Gold tokens?"
              answer="On testnet, Gold is minted to the contract deployer. Ask in the Territory community for some testnet Gold, or deploy your own contracts for testing purposes."
            />
            <FAQItem 
              question="Why is my transaction failing?"
              answer="Common reasons: 1) Not enough tBNB for gas fees, 2) Wrong network selected, 3) Not enough Gold deposited (for spawn), 4) Trying to attack with less than 25 units, 5) Trying to move to non-adjacent location."
            />
            <FAQItem 
              question="What happens if I lose an attack?"
              answer="If you attack and lose (your power is less than or equal to defender), you lose all attacking units. They are burned. The defender keeps the location."
            />
            <FAQItem 
              question="Can I withdraw my deposited Gold?"
              answer="Yes, you can withdraw Gold from escrow back to your wallet using the withdraw function. Your spawned units cannot be converted back to Gold."
            />
            <FAQItem 
              question="Why do I need to Approve before Deposit?"
              answer="ERC-20 tokens require approval before a contract can move them. This is a security feature. You only need to approve once (we request max approval)."
            />
            <FAQItem 
              question="What is the minimum attack size?"
              answer="You need at least 25 units to attack. This prevents spam attacks and ensures meaningful combat."
            />
            <FAQItem 
              question="How do I defend my captured locations?"
              answer="Use the Fortify action to deploy units at locations you own. These units defend against attackers. More units = more defense power."
            />
            <FAQItem 
              question="What does 'Power = Level x Units' mean?"
              answer="Your attack/defense power is calculated by multiplying unit level by unit count. Level 1 units have 1 power each, so 100 Level-1 units = 100 power."
            />
          </div>
        </Section>

        {/* Links */}
        <Section id="links" title="Links">
          <ul className="space-y-2 text-[#39c5cf]">
            <li>
              <a href="https://github.com/brouie/territory" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub Repository
              </a>
            </li>
            <li>
              <a href="https://opbnb-testnet.bscscan.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                opBNB Testnet Explorer
              </a>
            </li>
            <li>
              <a href="https://www.bnbchain.org/en/testnet-faucet" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                BNB Testnet Faucet
              </a>
            </li>
          </ul>
        </Section>

        {/* CTA */}
        <div className="mt-16 pt-8 border-t border-[#21262d] text-center">
          <p className="text-[#8b949e] mb-4">Ready to play?</p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#39c5cf] text-[#0a0e14] font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Play Territory
          </Link>
        </div>
      </div>
    </div>
  );
}
