import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDocument } from "@/api/documentApi";
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
  const navigate = useNavigate();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const response = await createDocument(docName.trim());
      const newDoc = response.data;
      setOpen(false);
      navigate(`/document/${newDoc._id}`);
    } catch (error) {
      console.error("Failed to create document", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
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
            onChange={(e) => setDocName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter>
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
