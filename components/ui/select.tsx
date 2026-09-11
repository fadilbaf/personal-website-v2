"use client"

import * as React from "react"
import { useState, useRef, useEffect, createContext, useContext, useMemo } from "react"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/src/app/lib/utils"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  search: string
  setSearch: (search: string) => void
  triggerRef: React.RefObject<HTMLDivElement | null>
  placeholder: string
  setPlaceholder: (placeholder: string) => void
  selectedLabel: string
  setSelectedLabel: (label: string) => void
  searchable?: boolean
}

const SelectContext = createContext<SelectContextType | null>(null)

function getTextContent(node: React.ReactNode): string {
  if (!node) return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join("")
  if (typeof node === "object" && "props" in node) {
    return getTextContent((node as any).props.children)
  }
  return ""
}

function findItemLabel(children: React.ReactNode, targetValue: string): string {
  let foundLabel = ""
  
  function search(node: React.ReactNode) {
    if (!node) return
    if (React.isValidElement(node)) {
      if ((node.props as any).value === targetValue) {
        foundLabel = getTextContent((node.props as any).children)
        return
      }
      if ((node.props as any).children) {
        React.Children.forEach((node.props as any).children, search)
      }
    } else if (Array.isArray(node)) {
      node.forEach(search)
    }
  }

  React.Children.forEach(children, search)
  return foundLabel
}

function Select({
  children,
  value,
  onValueChange,
  defaultValue,
  searchable = true,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  searchable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [selectedLabel, setSelectedLabel] = useState("")
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const [localValue, setLocalValue] = useState(defaultValue || "")

  const activeValue = value !== undefined ? value : localValue
  const handleValueChange = (val: string) => {
    setLocalValue(val)
    if (onValueChange) {
      onValueChange(val)
    }
    setOpen(false)
  }

  // Resolve matching label from children tree synchronously at render-time
  const matchedLabel = useMemo(() => findItemLabel(children, activeValue), [children, activeValue])
  const [prevMatchedLabel, setPrevMatchedLabel] = useState("")
  
  if (matchedLabel !== prevMatchedLabel) {
    setPrevMatchedLabel(matchedLabel)
    setSelectedLabel(matchedLabel)
  }

  // Reset search when opening/closing
  useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  return (
    <SelectContext.Provider
      value={{
        value: activeValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        search,
        setSearch,
        triggerRef,
        placeholder,
        setPlaceholder,
        selectedLabel,
        setSelectedLabel,
        searchable,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  placeholder,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  placeholder?: string
}) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  const { selectedLabel, setPlaceholder } = context

  useEffect(() => {
    if (placeholder) {
      setPlaceholder(placeholder)
    }
  }, [placeholder, setPlaceholder])

  return (
    <span
      data-slot="select-value"
      className={cn(
        selectedLabel ? "text-neutral-900 dark:text-white font-normal text-sm" : "text-neutral-400 dark:text-neutral-500 text-sm font-normal",
        className
      )}
      {...props}
    >
      {selectedLabel || placeholder}
    </span>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"button"> & {
  size?: "sm" | "default"
}) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")
  const { open, setOpen, triggerRef, selectedLabel, placeholder, search, setSearch, searchable = true } = context
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when open
  useEffect(() => {
    if (open && searchable) {
      inputRef.current?.focus()
    }
  }, [open, searchable])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("[data-slot=select-content]")
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setOpen, triggerRef])

  return (
    <div ref={triggerRef} className="relative w-full">
      {open && searchable ? (
        <div className="relative w-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={selectedLabel || placeholder}
            className={cn(
              "flex w-full items-center justify-between gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent py-2 pr-8 pl-3 text-sm shadow-xs outline-none focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 dark:bg-input/30 text-neutral-900 dark:text-white placeholder:text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              size === "default" ? "h-9" : "h-8",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <button
          type="button"
          data-slot="select-trigger"
          data-size={size}
          onClick={() => setOpen(!open)}
          className={cn(
            "group flex w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-8 pl-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className
          )}
          {...props}
        >
          {children}
        </button>
      )}
      <ChevronDownIcon
        className={cn(
          "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none size-4 text-muted-foreground transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </div>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  const { open, search } = context

  if (!open) return null

  // Count items and filtered items
  const childrenArray = React.Children.toArray(children)
  const items = childrenArray.filter(
    (child) => React.isValidElement(child) && (child.props as any).value !== undefined
  )
  
  const hasItems = items.length > 0

  const hasMatches = (() => {
    if (!search.trim()) return true
    const query = search.toLowerCase()
    return items.some((item) => {
      if (React.isValidElement(item)) {
        const itemLabel = getTextContent((item.props as any).children)
        return itemLabel.toLowerCase().includes(query)
      }
      return false
    })
  })()

  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1 min-w-36 origin-top duration-100 animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {!hasItems ? (
        <div className="p-2 text-center text-sm text-muted-foreground">No options found.</div>
      ) : !hasMatches ? (
        <div className="p-2 text-center text-sm text-muted-foreground">No results found.</div>
      ) : (
        children
      )}
    </div>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<"div"> & {
  value: string
}) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")
  const { value: selectedValue, onValueChange, search, setSelectedLabel } = context

  const label = getTextContent(children)

  // Filter out items based on search query
  if (search && label && !label.toLowerCase().includes(search.toLowerCase())) {
    return null
  }

  const isSelected = selectedValue === value

  return (
    <div
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors",
        isSelected && "bg-accent text-accent-foreground font-medium",
        className
      )}
      onClick={() => onValueChange && onValueChange(value)}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        {isSelected && <CheckIcon className="size-4" />}
      </span>
      <span>{children}</span>
    </div>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton() {
  return null
}

function SelectScrollDownButton() {
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
