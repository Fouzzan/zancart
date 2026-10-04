import { Edit, MoreHorizontal, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  deleteDeal,
  getDeals,
  toggleDealStatus,
} from "../../features/deals/dealServices";

const getDealTypeLabel = (type) => {
  switch (type) {
    case "flash_sale":
      return "Flash Sale";
    case "bogo":
      return "Buy 1 Get 1";
    case "bundle":
      return "Bundle";
    case "quantity_discount":
      return "Quantity Discount";
    default:
      return type || "Unknown";
  }
};

const getDealTypeClass = (type) => {
  switch (type) {
    case "flash_sale":
      return "bg-orange-100 text-orange-700";

    case "bogo":
      return "bg-purple-100 text-purple-700";

    case "bundle":
      return "bg-blue-100 text-blue-700";

    case "quantity_discount":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Deals() {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);

      const data = await getDeals();

      setDeals(data);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      toast.error("Failed to load deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleToggleStatus = async (deal) => {
    try {
      const updatedDeal = await toggleDealStatus(deal.id, !deal.isActive);

      setDeals((currentDeals) =>
        currentDeals.map((item) => (item.id === deal.id ? updatedDeal : item)),
      );

      toast.success(
        updatedDeal.isActive ? "Deal activated." : "Deal deactivated.",
      );
    } catch (error) {
      console.error("Failed to update deal status:", error);
      toast.error("Failed to update deal status.");
    }
  };

  const handleDelete = async (deal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${deal.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(deal.id);

      await deleteDeal(deal.id);

      setDeals((currentDeals) =>
        currentDeals.filter((item) => item.id !== deal.id),
      );

      toast.success("Deal deleted.");
    } catch (error) {
      console.error("Failed to delete deal:", error);
      toast.error("Failed to delete deal.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Deals</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage promotional offers for your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/deals/create")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Create Deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Deals" value={deals.length} />

        <StatCard
          label="Active Deals"
          value={deals.filter((deal) => deal.isActive).length}
        />

        <StatCard
          label="Inactive Deals"
          value={deals.filter((deal) => !deal.isActive).length}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <DealsTableSkeleton />
        ) : deals.length === 0 ? (
          <EmptyDeals onCreate={() => navigate("/deals/create")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Deal
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Products
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Duration
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {deals.map((deal) => (
                  <tr key={deal.id} className="transition hover:bg-gray-50">
                    {/* Deal */}
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-medium text-gray-900">
                          {deal.title}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {deal.description || "No description"}
                        </p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getDealTypeClass(
                          deal.type,
                        )}`}
                      >
                        {getDealTypeLabel(deal.type)}
                      </span>
                    </td>

                    {/* Products */}
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {deal.products?.length || 0} products
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-5">
                      <div className="text-sm">
                        <p className="text-gray-700">
                          {formatDate(deal.startDate)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          to {formatDate(deal.endDate)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(deal)}
                        className="inline-flex items-center gap-2"
                        title={
                          deal.isActive ? "Deactivate deal" : "Activate deal"
                        }
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            deal.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />

                        <span
                          className={`text-sm font-medium ${
                            deal.isActive ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {deal.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/deals/${deal.id}/edit`)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                          title="Edit deal"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(deal)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                          title={deal.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(deal)}
                          disabled={deletingId === deal.id}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete deal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          className="rounded-lg p-2 text-gray-400"
                          title="More"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DealsTableSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg bg-gray-100"
        />
      ))}
    </div>
  );
}

function EmptyDeals({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Plus className="h-5 w-5 text-gray-500" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">No deals yet</h2>

      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Create your first promotional deal to start offering special discounts
        to customers.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        Create Deal
      </button>
    </div>
  );
}

export default Deals;
