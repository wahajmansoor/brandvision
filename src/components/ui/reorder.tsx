"use client"

import { AnimatePresence, Reorder as MotionReorder, useDragControls } from "framer-motion"
import React, {
  createContext,
  forwardRef,
  useContext,
} from "react"
import { cn } from "@/lib/utils"

type ReorderContext<T> = {
  value: T[]
  onReorder: (order: T[]) => void
}

const ReorderContext = createContext<ReorderContext<any> | null>(null)

const useReorder = <T,>() => {
    const context = useContext<ReorderContext<T> | null>(ReorderContext)
    if (!context) {
        throw new Error("useReorder must be used within a Reorder component")
    }
    return context
}

const Reorder = <T,>({
    value,
    onReorder,
    className,
    ...props
  }: {
    value: T[]
    onReorder: (order: T[]) => void
  } & Omit<React.ComponentProps<typeof MotionReorder.Group>, "values" | "onReorder">) => {

    return (
      <ReorderContext.Provider
        value={{
          value,
          onReorder,
        }}
      >
        <MotionReorder.Group
          axis="y"
          values={value}
          onReorder={onReorder}
          className={cn("overflow-hidden", className)}
          {...props}
        />
      </ReorderContext.Provider>
    )
  }

type ItemContext = {
  value: any,
  dragControls: ReturnType<typeof useDragControls>
  isDragging: boolean
}

const ItemContext = createContext<ItemContext | null>(null)

const useReorderItem = () => {
    const context = useContext<ItemContext | null>(ItemContext)
    if (!context) {
        throw new Error("useReorderItem must be used within a Reorder.Item component")
    }
    return context
}

const Item = forwardRef<
  React.ElementRef<typeof MotionReorder.Item>,
  {
    value: any
  } & Omit<React.ComponentProps<typeof MotionReorder.Item>, "value">
>(({ value, ...props }, ref) => {
    const dragControls = useDragControls()
    
    return (
        <ItemContext.Provider value={{ value, dragControls, isDragging: false }}>
            <MotionReorder.Item
                ref={ref}
                value={value}
                dragListener={false}
                dragControls={dragControls}
                {...props}
            />
        </ItemContext.Provider>
    )
})

Item.displayName = "Reorder.Item"


const ReorderRoot = Object.assign(Reorder, {
  Item,
  AnimatePresence
})

export {
  ReorderRoot as Reorder,
  useReorderItem,
  useReorder,
}
