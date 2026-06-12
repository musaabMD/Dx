"use client"

import * as React from "react"

const CountsContext = React.createContext({
  projects: 0,
  tasks: 0,
  articles: 0,
  books: 0,
})

export function CountsProvider({ children, counts = {} }) {
  return (
    <CountsContext.Provider value={counts}>
      {children}
    </CountsContext.Provider>
  )
}

export function useCounts() {
  return React.useContext(CountsContext)
}
