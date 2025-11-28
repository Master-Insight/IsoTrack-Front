import { create } from 'zustand'

interface FlowInteractionState {
  hoveredNodeId: string | null
  selectedNodeId: string | null
  setHoveredNode: (id: string | null) => void
  setSelectedNode: (id: string | null) => void
  resetInteraction: () => void
}

export const useFlowInteraction = create<FlowInteractionState>((set) => ({
  hoveredNodeId: null,
  selectedNodeId: null,
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  resetInteraction: () => set({ hoveredNodeId: null, selectedNodeId: null }),
}))
