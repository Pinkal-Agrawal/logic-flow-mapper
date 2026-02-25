import type { LogicNode } from '../types'

type NodeMap = Record<string, LogicNode>
type AdjList = Record<string, string[]>

function buildGraph(nodes: NodeMap): AdjList {
  const graph: AdjList = {}
  for (const id in nodes) {
    graph[id] = [...nodes[id].childIds]
    if (nodes[id].linkedToId) {
      graph[id].push(nodes[id].linkedToId as string)
    }
  }
  return graph
}

// current recursion path
export function detectCycles(nodes: NodeMap): Set<string> {
  const graph = buildGraph(nodes)
  const visited = new Set<string>()
  const cycleNodes = new Set<string>()

  function dfs(nodeId: string, path: string[], inStack: Set<string>): void {
    if (inStack.has(nodeId)) {
      const start = path.indexOf(nodeId)
      for (let i = start; i < path.length; i++) cycleNodes.add(path[i])
      cycleNodes.add(nodeId)
      return
    }
    if (visited.has(nodeId)) return

    visited.add(nodeId)
    inStack.add(nodeId)
    path.push(nodeId)

    for (const neighbor of graph[nodeId] ?? []) {
      dfs(neighbor, path, inStack)
    }

    path.pop()
    inStack.delete(nodeId)
  }

  for (const id in nodes) {
    dfs(id, [], new Set())
  }

  return cycleNodes
}
