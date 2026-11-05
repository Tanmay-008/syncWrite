import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserDocuments,
  deleteDocument,
  type UserDocument,
} from "@/api/documentApi";
import {
  FileText,
  Clock,
  Users,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateDocButton } from "./CreateDocButton";
import { useDebounce } from "@/hooks/useDebounce";

export function UserDocumentsList() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterTab, setFilterTab] = useState<"all" | "owned" | "shared">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const docs = await getUserDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load user documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.documentName
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (filterTab === "owned") return doc.isOwner;
      if (filterTab === "shared") return !doc.isOwner;
      return true;
    });
  }, [documents, debouncedSearchQuery, filterTab]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="w-full">
      {/* Header controls: Search, Filter Tabs, Refresh */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          {searchQuery !== debouncedSearchQuery ? (
            <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 animate-spin" />
          ) : (
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="h-10 rounded-xl bg-white pl-9 text-sm shadow-xs border-slate-200 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400"
          />
        </div>

        {/* Filter Tabs & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-200/60 p-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => setFilterTab("all")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterTab === "all"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setFilterTab("owned")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterTab === "owned"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Created by me
            </button>
            <button
              onClick={() => setFilterTab("shared")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterTab === "shared"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Shared
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDocs}
            disabled={isLoading}
            title="Refresh list"
            className="h-9 w-9 cursor-pointer rounded-xl text-slate-500 hover:bg-slate-200/70 hover:text-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <div className="h-3 w-16 rounded bg-slate-100" />
                <div className="h-3 w-12 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center shadow-xs">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {searchQuery ? "No matching documents" : "No documents yet"}
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500">
            {searchQuery
              ? `No document found matching "${searchQuery}". Try a different search term.`
              : "Create a new document to start writing and collaborating in real time."}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <CreateDocButton />
            </div>
          )}
        </div>
      ) : (
        /* Document Cards Grid */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => {
            const isDeleting = deletingId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                {/* Top section: Icon, Title, Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-semibold text-slate-900 group-hover:text-slate-950">
                        {doc.documentName}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        {doc.isOwner ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                            Collaborator
                          </span>
                        )}

                        {doc.collaboratorsCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Users className="h-3 w-3" />
                            {doc.collaboratorsCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete button (only for owner) */}
                  {doc.isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      onClick={(e) => handleDelete(e, doc.id)}
                      title="Delete document"
                      className="h-8 w-8 shrink-0 cursor-pointer rounded-lg text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Bottom section: Last Updated */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatTime(doc.updatedAt)}
                  </span>
                  <span className="font-medium text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Open document &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

