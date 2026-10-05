"use client"

import { useState, type ReactNode } from "react"
import { Check, Copy, Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { downloadTextFile } from "@/features/ontology/components/export-ontology-dialog/export-utils"
import { cn } from "@/lib/utils"

interface ImportFormatCodeCardProps {
  title: string
  description: string
  fileName: string
  content: string
  badge?: ReactNode
  className?: string
  contentClassName?: string
}

export function ImportFormatCodeCard({
  title,
  description,
  fileName,
  content,
  badge,
  className,
  contentClassName,
}: ImportFormatCodeCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success(`${title} copied.`)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error(`Could not copy ${title.toLowerCase()}.`)
    }
  }

  function handleDownload() {
    downloadTextFile(fileName, content, "application/json")
    toast.success(`${title} downloaded.`)
  }

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col gap-3 rounded-lg border bg-card p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            {badge}
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Textarea
        readOnly
        aria-label={title}
        spellCheck={false}
        value={content}
        className={cn(
          "min-h-0 resize-none overflow-auto overscroll-contain rounded-md bg-muted/40 font-mono leading-5 whitespace-pre",
          contentClassName ?? "h-[50vh] min-h-[20rem]"
        )}
      />
    </section>
  )
}
