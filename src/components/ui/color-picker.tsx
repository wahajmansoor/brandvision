"use client"

import * as React from "react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  children: React.ReactNode
}

export function ColorPicker({ color, onChange, children }: ColorPickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={handleChange}
        className="invisible w-0 h-0"
      />
      {children}
    </div>
  )
}
