export interface LogicNode {
  id: string
  condition: string
  childIds: string[]
  linkedToId: string | null
  parentId: string | null
}

export interface LogicState {
  nodes: Record<string, LogicNode>
  rootIds: string[]
  cycleNodeIds: string[]
  hasCycle: boolean
}

export interface AddChildPayload { parentId: string }
export interface SetConditionPayload { id: string; value: string }
export interface DeleteNodePayload { id: string }
export interface SetLinkPayload { fromId: string; toId: string | null }
