import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  LogicState, LogicNode,
  AddChildPayload, SetConditionPayload, DeleteNodePayload, SetLinkPayload,
} from '../types'
import { detectCycles } from '../utils/cycleDetection'

let nodeCounter = 1
const newId = () => `node_${nodeCounter++}`

const createNode = (id: string, parentId: string | null = null): LogicNode => ({
  id, condition: '', childIds: [], linkedToId: null, parentId,
})

function runCycleCheck(state: LogicState) {
  const cycles = detectCycles(state.nodes)
  state.cycleNodeIds = [...cycles]
  state.hasCycle = cycles.size > 0
}

function getSubtree(nodes: LogicState['nodes'], rootId: string): string[] {
  const out: string[] = []
  function walk(id: string) {
    if (!nodes[id]) return
    out.push(id)
    nodes[id].childIds.forEach(walk)
  }
  walk(rootId)
  return out
}

const firstId = newId()

const initialState: LogicState = {
  nodes: { [firstId]: { ...createNode(firstId), condition: '' } },
  rootIds: [firstId],
  cycleNodeIds: [],
  hasCycle: false,
}

const logicSlice = createSlice({
  name: 'logic',
  initialState,
  reducers: {
    addChild(state, action: PayloadAction<AddChildPayload>) {
      const { parentId } = action.payload
      if (!state.nodes[parentId]) return
      const id = newId()
      state.nodes[id] = createNode(id, parentId)
      state.nodes[parentId].childIds.push(id)
      runCycleCheck(state)
    },

    addRoot(state) {
      const id = newId()
      state.nodes[id] = createNode(id, null)
      state.rootIds.push(id)
    },

    setCondition(state, action: PayloadAction<SetConditionPayload>) {
      const { id, value } = action.payload
      if (state.nodes[id]) state.nodes[id].condition = value
    },

    deleteNode(state, action: PayloadAction<DeleteNodePayload>) {
      const { id } = action.payload
      if (!state.nodes[id]) return

      const toRemove = new Set(getSubtree(state.nodes, id))
      const parentId = state.nodes[id].parentId
      if (parentId && state.nodes[parentId]) {
        state.nodes[parentId].childIds = state.nodes[parentId].childIds.filter(c => c !== id)
      }

      state.rootIds = state.rootIds.filter(rid => !toRemove.has(rid))

      // TODO: could show a warning to the user here instead of silently clearing
      for (const nodeId in state.nodes) {
        if (state.nodes[nodeId].linkedToId && toRemove.has(state.nodes[nodeId].linkedToId!)) {
          state.nodes[nodeId].linkedToId = null
        }
      }

      toRemove.forEach(nid => delete state.nodes[nid])
      runCycleCheck(state)
    },

    setLink(state, action: PayloadAction<SetLinkPayload>) {
      const { fromId, toId } = action.payload
      if (!state.nodes[fromId]) return
      state.nodes[fromId].linkedToId = toId
      runCycleCheck(state)
    },
  },
})

export const { addChild, addRoot, setCondition, deleteNode, setLink } = logicSlice.actions
export default logicSlice.reducer
