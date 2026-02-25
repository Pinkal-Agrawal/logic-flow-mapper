# Logic Flow Mapper

A tool for building nested if-then logic trees with real time cycle detection.

## Running it

npm install
npm run dev

## Stack

- React 18 + TypeScript
- Redux Toolkit (state management)
- Vite (build tool)


## Data structure — why I went with normalized state

My first instinct was to store nodes as a nested tree, which feels natural for a tree UI. But I ran into a problem pretty quickly: **the feature requires cross-linking nodes**, which breaks the tree structure entirely. Once node A can point to node C anywhere in the tree, you don't have a tree anymore — you have a directed graph.

So I went with a normalized flat map:

```ts
nodes: Record<string, LogicNode>
```

Each node stores its own `childIds` and an optional `linkedToId` for cross-links. There's also a `parentId` for deletion (so you can detach a node from its parent without traversing the whole graph to find it).

The other reason I kept flat: updating deeply nested state in Redux/Immer is genuinely annoying. With a flat map, any update is just `state.nodes[id].condition = value` instead of drilling 4 levels deep.

---

## Cycle detection

I used DFS with a "current path" set, which is the standard approach for detecting back-edges in a directed graph.

The core insight is: you need **two** separate tracking structures, not one.

- `visited` — nodes we've fully explored (any path)
- `inStack` — nodes in the *current* DFS path

If we reach a node that's already in `inStack`, that's a back-edge and means we've found a cycle. Just checking `visited` isn't enough — a node can be visited from multiple branches without creating a cycle.

```
dfs(node, path, inStack):
  if node in inStack → cycle! mark everything from cycle start to here
  if node in visited → skip (already explored, no cycle via this node)
  
  add to visited + inStack
  recurse into neighbors (children + linked node)
  remove from inStack  ← backtrack
```

Time complexity is O(V + E) — each node and edge gets visited once.

I run this after every structural change (add child, delete, set link) so the UI stays in sync. Condition text edits don't trigger it since they don't change the graph.

---

## Edge cases I had to think through

**Deleting a node** — if you delete a parent, you need to delete the whole subtree, clean up the parent's `childIds`, and also null out any `linkedToId` from surviving nodes that pointed into the deleted subtree. That last part is easy to miss.

**Multiple roots** — the graph might not be connected, so the DFS needs to start from every node, not just one root.

**Linking a node to itself** — technically works, gets caught as a cycle immediately.

---

## What I'd improve with more time

- Undo/redo (Redux makes this pretty doable with a history stack)
- Drag to reorder nodes
- Export to JSON / import back
- Better visualization for the link arrows (right now it's just text, would be nice to draw actual SVG lines)
