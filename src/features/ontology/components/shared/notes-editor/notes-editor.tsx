"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { createNote } from "@/features/ontology/server/actions/notes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { NoteRow } from "./note-row"
import type { NotesEditorProps } from "./types"

export function NotesEditor({ ontologyId, target, notes }: NotesEditorProps) {
  const [body, setBody] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!body.trim()) return
    const nextSortOrder =
      notes.reduce((max, note) => Math.max(max, note.sort_order), -1) + 1
    startTransition(async () => {
      try {
        await createNote(
          ontologyId,
          target,
          body.trim(),
          authorName.trim(),
          nextSortOrder
        )
        setBody("")
        setAdding(false)
        toast.success("Note added.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Notes ({notes.length})
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setAdding(true)}
          disabled={adding}
          aria-label="Add note"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {adding ? (
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
            placeholder="Add a note"
            className="min-h-20"
            disabled={isPending}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setBody("")
                setAdding(false)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={isPending || !body.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {notes.length > 0 ? (
          notes.map((note) => <NoteRow key={note.id} note={note} />)
        ) : (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            No notes yet.
          </p>
        )}
      </div>
    </div>
  )
}
