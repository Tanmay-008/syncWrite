import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDocument } from "@/api/documentApi";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function CreateDocButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      navigate("/signin");
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      setErrorMessage(null);
      setDocName("");
    }
  };

  const handleCreate = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await createDocument(docName.trim());
      const newDoc = response?.data;
      const docId = newDoc?._id || newDoc?.id;

      if (!docId) {
        setErrorMessage("Server did not return a valid document ID. Please try again.");
        return;
      }

      setOpen(false);
      setDocName("");
      navigate(`/document/${docId}`);
    } catch (error: any) {
      console.error("Failed to create document", error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Backend server is unavailable or creation failed. Please check your connection.";
      setErrorMessage(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      navigate("/signin");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            onClick={handleTriggerClick}
            className="h-12 cursor-pointer gap-2 rounded-xl px-6 text-base font-medium shadow-lg shadow-slate-900/10 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/15"
          />
        }
      >
        <Plus className="h-5 w-5" />
        Create New Document
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Give your document a name. You can also leave it empty to use the default name.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            id="name"
            placeholder="Document Name (e.g. My Notes)"
            value={docName}
            onChange={(e) => {
              setDocName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleCreate()}
            autoFocus
          />

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center gap-2">
          {errorMessage && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button disabled={isLoading} onClick={handleCreate}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
