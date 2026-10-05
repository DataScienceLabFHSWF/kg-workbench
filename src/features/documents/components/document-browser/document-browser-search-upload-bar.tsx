"use client"

import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DocumentBrowserSearchUploadBarProps {
  search: string
  onSearchChange: (value: string) => void
  onUploadClick: () => void
}

export function DocumentBrowserSearchUploadBar({
  search,
  onSearchChange,
  onUploadClick,
}: DocumentBrowserSearchUploadBarProps) {
  return (
    <div className="flex h-8 shrink-0 items-center gap-1 border-b px-2">
      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search documents..."
        className="h-6 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
      />
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onUploadClick}
        title="Upload document for extraction"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
