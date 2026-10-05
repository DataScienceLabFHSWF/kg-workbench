"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

import type { OntologyNote } from "@/domain/ontology"
import {
  deleteNote,
  updateNote,
} from "@/features/ontology/server/actions/notes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface NoteRowProps {
  note: OntologyNote
}

function formatNoteTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function NoteRow({ note }: NoteRowProps) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(note.body)
  const [authorName, setAuthorName] = useState(note.author_name)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!body.trim()) return
    startTransition(async () => {
      try {
        await updateNote(note.id, {
          body: body.trim(),
          authorName: authorName.trim(),
        })
        setEditing(false)
        toast.success("Note saved.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteNote(note.id)
        toast.success("Note deleted.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Delete failed.")
      }
    })
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-md border p-3">
        <Input
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Author"
          className="h-8"
          disabled={isPending}
        />
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-20"
          disabled={isPending}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setBody(note.body)
              setAuthorName(note.author_name)
              setEditing(false)
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending || !body.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 rounded-md border p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs text-muted-foreground">
          {note.author_name || "Unknown author"} -{" "}
          {formatNoteTimestamp(note.created_at)}
        </p>
        <p className="text-sm whitespace-pre-wrap">{note.body}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setEditing(true)}
          disabled={isPending}
          aria-label="Edit note"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete note"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
