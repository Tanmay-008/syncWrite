import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateDocButton() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      // Simulate a short delay for doc creation
      // Replace with actual API call: const res = await axios.post("/api/documents");
      await new Promise((resolve) => setTimeout(resolve, 600));
      const docId = crypto.randomUUID().slice(0, 8);
      navigate(`/document/${docId}`);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleCreate}
      disabled={isLoading}
      className="h-12 cursor-pointer gap-2 rounded-xl px-6 text-base font-medium shadow-lg shadow-slate-900/10 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/15"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
      {isLoading ? "Creating..." : "Create New Document"}
    </Button>
  );
}
