import Link from "next/link";
import { Plus, Clock, ShieldCheck, FileText, ArrowRight } from "lucide-react";

export default function AdvertiserDashboardPage() {
  // Demo dashboard campaigns
  const campaigns = [
    {
      id: "camp-demo-1",
      name: "Acme Diwali Mega Brand Activation",
      brand: "Acme Brands India",
      zoneName: "Bangalore MG Road Corridor",
      status: "DRAFT",
      startAt: "2026-11-01T18:00:00Z",
      endAt: "2026-11-01T20:00:00Z",
      createdAt: "2026-10-15T12:00:00Z",
    },
    {
      id: "camp-demo-2",
      name: "Starlight Winter Tech Fest Promo",
      brand: "Starlight Events",
      zoneName: "Mumbai BKC Financial Hub",
      status: "SUBMITTED",
      startAt: "2026-11-15T17:30:00Z",
      endAt: "2026-11-15T21:30:00Z",
      createdAt: "2026-10-14T09:30:00Z",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            Draft
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Submitted for Review
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            Under Review
          </span>
        );
      case "APPROVED_FOR_SCHEDULING":
      case "SCHEDULED":
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Aervy
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Advertiser Dashboard</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <p className="font-semibold">⚠️ Safety Boundary Reminder:</p>
          <p className="mt-0.5">
            Campaign submissions on Aervy represent <strong>operational requests</strong> for review.
            All flight operations require separate day-of-ops pilot approval, ATC airspace clearance, and weather validation.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Campaigns</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{campaigns.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Drafts in Progress</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {campaigns.filter((c) => c.status === "DRAFT").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Under Operations Review</span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-blue-600">
              {campaigns.filter((c) => c.status === "SUBMITTED").length}
            </p>
          </div>
        </div>

        {/* Campaigns Directory */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Your Campaigns</h2>
              <p className="text-xs text-slate-500">
                Track draft creation, operations review, and scheduled flight windows.
              </p>
            </div>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              Start New Campaign
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Flight Zone</th>
                  <th className="px-6 py-3">Requested Window</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{camp.name}</div>
                      <div className="text-xs text-slate-500">{camp.brand}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">{camp.zoneName}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(camp.startAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {camp.status === "DRAFT" ? (
                        <Link
                          href="/app/campaigns/new"
                          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Continue Draft
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Under Review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
