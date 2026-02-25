# Logic Flow Mapper

A tool for building nested if-then logic trees with real time cycle detection.

## Running it

npm install
npm run dev

## Stack

- React 18 + TypeScript
- Redux Toolkit (state management)
- Vite (build tool)


## Data structure  why normalized state is used

My first instinct was to store nodes as a nested tree, which feels natural for a tree UI. But I ran into a problem pretty quickly: **the feature requires cross-linking nodes**, which breaks the tree structure entirely. Once node A can point to node C anywhere in the tree, you don't have a tree anymore, you have a directed graph.

Each node stores its own `childIds` and an optional `linkedToId` for cross-links. There's also a `parentId` for deletion so you can detach a node from its parent without traversing the whole graph to find it.

The other reason I kept flat: updating deeply nested state in Redux is genuinely annoying. With a flat map, any update is just `state.nodes[id].condition = value` instead of drilling 4 levels deep.

---

## Cycle detection

I used DFS with a "current path" set, which is the standard approach for detecting back edges in a directed graph.

The core insight is: you need **two** separate tracking structures, not one.

- `visited` — nodes we've fully explored
- `inStack` — nodes in the *current* DFS path

If we reach a node that's already in `inStack`, means we've found a cycle. Just checking `visited` isn't enough ,a node can be visited from multiple branches without creating a cycle.

```
dfs(node, path, inStack):
  if node in inStack → cycle! mark everything from cycle start to here
  if node in visited → skip (already explored, no cycle via this node)
  
  add to visited + inStack
  recurse into neighbors (children + linked node)
  remove from inStack  ← backtrack
```

I run this after every structural change (add child, delete, set link) so the UI stays in sync. Condition text edits don't trigger it since they don't change the graph.



