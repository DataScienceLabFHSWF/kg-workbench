interface ValidationErrorProps {
  message: string | null
}

export function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null

  return <p className="text-xs text-destructive">{message}</p>
}
