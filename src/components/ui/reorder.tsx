"use client"

import { Command as CommandPrimitive } from "cmdk"
import { type DialogProps } from "@radix-ui/react-dialog"
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { cn } from "@/lib/utils"

type ReorderContext<T> = {
  order: T[]
  setOrder: (order: T[]) => void
  onReorder?: (order: T[]) => void
  disabled?: boolean
  valueKey?: keyof T
}

const ReorderContext = createContext<ReorderContext<any>>({
  order: [],
  setOrder: () => {},
})

const useReorder = <T,>() => useContext<ReorderContext<T>>(ReorderContext)

const Reorder = <T,>({
  order,
  onReorder,
  disabled,
  valueKey,
  ...props
}: {
  order: T[]
  onReorder: (order: T[]) => void
  disabled?: boolean
  valueKey?: keyof T
} & Omit<React.ComponentProps<typeof CommandPrimitive>, "value" | "onValueChange">) => {
  const [value, setValue] = useState("")

  return (
    <ReorderContext.Provider
      value={{
        order,
        setOrder: onReorder,
        onReorder,
        disabled,
        valueKey,
      }}
    >
      <CommandPrimitive
        onValueChange={setValue}
        value={value}
        {...props}
      />
    </ReorderContext.Provider>
  )
}

const Group = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  { as?: React.ElementType } & Omit<
    React.ComponentProps<typeof CommandPrimitive.Group>,
    "value" | "asChild"
  >
>(({ as: As = "div", ...props }, ref) => {
  const { order } = useReorder()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <As>
      <CommandPrimitive.Group
        ref={ref}
        {...props}
        // Force the same order as the provided `order`
        value={JSON.stringify(order)}
      />
    </As>
  )
})

Group.displayName = "Reorder.Group"

type ItemContext = {
  value: any
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>) => void
  onDragEnd?: (event: React.PointerEvent<HTMLDivElement>) => void
  onDragMove?: (event: React.PointerEvent<HTMLDivElement>) => void
  isDragging: boolean
  isSorting: boolean
}

const ItemContext = createContext<ItemContext>({
  value: "",
  isDragging: false,
  isSorting: false,
})

const useItem = () => useContext(ItemContext)

const Item = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  {
    as?: React.ElementType
    value: any
  } & Omit<React.ComponentProps<typeof CommandPrimitive.Item>, "value" | "onSelect" | "asChild">
>(({ as: As = "div", value, children, ...props }, ref) => {
  const { order, setOrder, onReorder, disabled, valueKey } = useReorder()
  const [isDragging, setIsDragging] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const onDragStart = useCallback(() => {
    if (disabled) return
    setIsDragging(true)
    setIsSorting(true)
  }, [disabled])

  const onDragEnd = useCallback(() => {
    if (disabled) return
    setIsDragging(false)
    setIsSorting(false)

    if (!onReorder) return
    onReorder(order)
  }, [disabled, onReorder, order])

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    if (!isDragging) return

    const dragElement = dragRef.current
    if (!dragElement) return

    const parent = dragElement.parentElement
    if (!parent) return

    const elements = Array.from(parent.children) as (HTMLDivElement & {
      value: string
    })[]

    const dragIndex = elements.findIndex(el => el.contains(dragElement))

    // Find the element to swap with
    let swapIndex: number | undefined

    for (let i = 0; i < elements.length; i++) {
      if (i === dragIndex) continue

      const el = elements[i]
      const rect = el.getBoundingClientRect()
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom

      if (isInside) {
        swapIndex = i
        break
      }
    }

    if (swapIndex === undefined) return

    const newOrder = [...order]
    const [removed] = newOrder.splice(dragIndex, 1)
    newOrder.splice(swapIndex, 0, removed)
    setOrder(newOrder)
  }

  return (
    <ItemContext.Provider
      value={{
        value,
        onDragStart,
        onDragEnd,
        onDragMove,
        isDragging,
        isSorting,
      }}
    >
      <CommandPrimitive.Item
        {...props}
        ref={ref}
        value={valueKey ? value[valueKey] : JSON.stringify(value)}
        asChild
        data-sorting={isSorting}
        data-dragging={isDragging}
        onPointerDown={onDragStart}
        onPointerUp={onDragEnd}
        onPointerMove={onDragMove}
        className={cn(isDragging && "z-50", props.className)}
      >
        <As ref={dragRef}>{children}</As>
      </CommandPrimitive.Item>
    </ItemContext.Provider>
  )
})

Item.displayName = "Reorder.Item"

const DragHandle = forwardRef<
  HTMLDivElement,
  {
    withHandle?: boolean
  } & React.ComponentProps<"div">
>(({ children, className, withHandle, ...props }, ref) => {
  const { onDragStart, onDragEnd, onDragMove, isDragging, disabled } = useItem()

  if (withHandle) {
    return (
      <div
        {...props}
        ref={ref}
        onPointerDown={onDragStart}
        onPointerUp={onDragEnd}
        onPointerMove={onDragMove}
        className={cn(
          !disabled && isDragging
            ? "cursor-grabbing"
            : !disabled
            ? "cursor-grab"
            : "cursor-auto",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return <div {...props}>{children}</div>
})

DragHandle.displayName = "Reorder.DragHandle"

const Dialog = ({ ...props }: DialogProps) => {
  return <CommandPrimitive.Dialog {...props} />
}

Dialog.displayName = "Reorder.Dialog"

const ReorderRoot = Object.assign(Reorder, {
  Group,
  Item,
  DragHandle,
  Dialog,
  Empty: CommandPrimitive.Empty,
  Input: CommandPrimitive.Input,
  List: CommandPrimitive.List,
  Separator: CommandPrimitive.Separator,
})

export {
  ReorderRoot as Reorder,
  useItem as useReorderItem,
  useReorder,
}
