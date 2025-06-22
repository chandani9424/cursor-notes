import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

export async function createNote(
  sessionId: string | null,
  router: any,
  addNewPinnedNote: (slug: string) => void,
  refreshSessionNotes: () => Promise<void>,
  setSelectedNoteSlug: (slug: string | null) => void,
  isMobile: boolean
) {
  try {
    const id = uuidv4();
    const slug = `new-note-${id}`;
    const created_at = new Date().toISOString();
    const note = {
      id,
      slug,
      title: "",
      content: "",
      public: false,
      session_id: sessionId || uuidv4(),
      category: "today",
      emoji: "👋🏼",
      created_at
    };
    const supabase = createClient();
    const { data, error } = (await supabase.from("notes").insert(note)) || { data: null, error: null };
    if (error) throw error;
    addNewPinnedNote(slug);
    await refreshSessionNotes();
    if (isMobile) {
      router.push(`/notes/${slug}`);
    } else {
      setSelectedNoteSlug(slug);
      if (router.refresh) router.refresh();
    }
    toast({
      description: "Private note created",
    });
  } catch (error) {
    console.error("Error creating note:", error);
  }
}
