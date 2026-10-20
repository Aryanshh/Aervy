import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Clock,
  UploadCloud,
  ArrowRight,
  HelpCircle,
  Plane,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
              Aervy
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">How It Works</span>
          </div>

          <nav className="flex items-center space-x-6 text-xs sm:text-sm font-medium text-slate-600">
            <Link href="/safety" className="hover:text-blue-600">
              Safety & Regulations
            </Link>
            <Link href="/app/campaigns" className="hover:text-blue-600">
              Track Campaigns
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              New Campaign
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Page Intro */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Operational Operating Model
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From Digital Ingestion to Certified Flight Execution
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Aervy bridges the gap between digital advertising agility and regulated airspace safety.
              Here is how our 5-phase coordination sequence guarantees compliant, high-impact aerial brand activations.
            </p>
          </div>

          {/* Safety Reminder Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
            <p className="font-bold">⚠️ Core Safety & Regulatory Principle:</p>
            <p className="mt-1">
              Submitting a campaign on Aervy is an <strong>operational request for feasibility review</strong>, never an automated flight authorization.
              All actual drone flight operations are physically conducted by certified remote pilots in command (RPIC) with separate airspace clearance and day-of-ops weather sign-off.
            </p>
          </div>

          {/* 5-Phase Detailed Breakdown */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">The 5-Phase Campaign Journey</h2>

            {[
              {
                num: "Phase 1",
                title: "Digital Creative Ingestion & Aspect Ratio Validation",
                desc: "Advertisers upload high-resolution banner or video creatives. Aervy validates dimensions (1080p minimum, 16:9 aspect ratio), file sizes, and typography contrast to ensure readability from ground spectator viewpoints.",
                icon: UploadCloud,
              },
              {
                num: "Phase 2",
                title: "Airspace Slot Availability & 15-Minute Reservation Hold",
                desc: "Advertisers select from pre-approved DGCA Green Zones. Upon selecting a date and time window, Aervy places a temporary 15-minute slot hold to prevent overlapping flights or conflicting schedules in the corridor.",
                icon: MapPin,
              },
              {
                num: "Phase 3",
                title: "Deterministic Server-Verified Quote & Escrow Payment",
                desc: "Quotes are computed strictly in integer paise (INR) with 18% GST. A cryptographic hash of all pricing parameters protects against client-side tampering before test payment processing.",
                icon: Clock,
              },
              {
                num: "Phase 4",
                title: "Human-in-the-Loop Operations Safety Review",
                desc: "A certified Operations Reviewer inspects the campaign against 4 mandatory pillars: Airspace clearance, local weather forecasts (<15 knots wind), creative content policy, and on-site pilot availability. If unfeasible, a full automatic refund is triggered immediately.",
                icon: ShieldCheck,
              },
              {
                num: "Phase 5",
                title: "On-Site Pilot Dispatch & Milestone Tracking",
                desc: "Once approved and scheduled, ground operations teams receive mission packets. Advertisers track progress through operational milestones: Scheduled -> Ready for Operations -> In Progress -> Completed.",
                icon: Plane,
              },
            ].map((phase, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                  <phase.icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {phase.num}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{phase.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Aervy Digital Aerial Platform vs Traditional Static Billboards
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Compare how aerial display coordination contrasts with legacy physical Out-Of-Home (OOH) media.
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3 text-blue-600">Aervy Aerial Platform</th>
                    <th className="px-4 py-3 text-slate-400">Traditional Static Billboards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">Deployment Lead Time</td>
                    <td className="px-4 py-3.5 text-blue-700 font-medium">Hours to 2 days (fast digital review)</td>
                    <td className="px-4 py-3.5 text-slate-600">2 to 4 weeks (physical printing & mounting)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">Location Agility</td>
                    <td className="px-4 py-3.5 text-blue-700 font-medium">Multiple approved corridors across cities</td>
                    <td className="px-4 py-3.5 text-slate-600">Fixed physical structure only</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">Pricing Transparency</td>
                    <td className="px-4 py-3.5 text-blue-700 font-medium">Exact integer paise per flight hour + 18% GST</td>
                    <td className="px-4 py-3.5 text-slate-600">Opaque monthly leases with hidden printing costs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">Refund Guarantee</td>
                    <td className="px-4 py-3.5 text-blue-700 font-medium">100% automated refund on weather/airspace cancellation</td>
                    <td className="px-4 py-3.5 text-slate-600">Strictly non-refundable</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">Regulatory Compliance</td>
                    <td className="px-4 py-3.5 text-blue-700 font-medium">DGCA Green Zones & Human RPIC verified</td>
                    <td className="px-4 py-3.5 text-slate-600">Municipal corporation permits</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">What happens if rain or high wind occurs on flight day?</h4>
                <p className="text-slate-600">
                  Operations safety guidelines mandate an automatic flight hold if sustained winds exceed 14 knots or precipitation begins.
                  If the scheduled window cannot be safely executed, the campaign is rescheduled or fully refunded.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">Can an advertiser control or pilot the drone directly?</h4>
                <p className="text-slate-600">
                  No. The Aervy web application strictly manages digital assets, scheduling, and quote verification.
                  Direct drone piloting is exclusively managed by licensed on-site remote pilots in command (RPIC).
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">How are campaign quotes calculated?</h4>
                <p className="text-slate-600">
                  Quotes are calculated from the zone&apos;s base hourly rate multiplied by requested flight hours, plus dynamic peak factors (if applicable), and 18% GST. All calculations are executed server-side in integer paise.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">How long does Operations feasibility review take?</h4>
                <p className="text-slate-600">
                  Most submissions are reviewed within 4 to 12 operational hours by our safety and airspace verification leads.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="rounded-2xl bg-blue-600 p-8 text-center text-white shadow-lg">
            <h3 className="text-2xl font-bold">Ready to Plan Your First Campaign?</h3>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
              Choose an approved green airspace corridor, upload your digital creative, and receive an instant quote.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link
                href="/app/campaigns/new"
                className="rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
              >
                Create Campaign Request
              </Link>
              <Link
                href="/safety"
                className="rounded-md border border-white/30 bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Review Safety Policies
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Aervy Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
