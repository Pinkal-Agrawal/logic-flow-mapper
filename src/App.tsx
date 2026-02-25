import React from 'react'
import { useAppDispatch, useAppSelector } from './store'
import { addRoot } from './store/logicSlice'
import NodeCard from './components/NodeCard'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const rootIds = useAppSelector(s => s.logic.rootIds)
  const hasCycle = useAppSelector(s => s.logic.hasCycle)
  const cycleCount = useAppSelector(s => s.logic.cycleNodeIds.length)
  const nodeCount = useAppSelector(s => Object.keys(s.logic.nodes).length)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', display: 'flex', alignItems: 'center',
        height: 52, gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff', flexShrink: 0,
          }}>⌥</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Logic Flow Mapper
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-muted)', fontFamily: 'var(--mono)', marginTop: 1 }}>
              {nodeCount} node{nodeCount !== 1 ? 's' : ''}
              {hasCycle
                ? <span style={{ color: 'var(--danger)', marginLeft: 6 }}>· {cycleCount} in cycle</span>
                : <span style={{ color: 'var(--ink-faint)', marginLeft: 6 }}>· no cycles</span>
              }
            </div>
          </div>
        </div>

        <button
          className="header-btn"
          onClick={() => dispatch(addRoot())}
        >
          + Add root
        </button>
      </header>

      {hasCycle && (
        <div style={{
          background: '#fff5f5', borderBottom: '1px solid var(--danger-border)',
          padding: '8px 24px', fontSize: 12, color: 'var(--danger)',
          fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontWeight: 600 }}>↺ logic loop detected</span>
          <span style={{ color: '#ef9090' }}>—</span>
          <span>nodes marked in red are part of a cycle. remove the link or delete the node to fix.</span>
        </div>
      )}

      <main style={{
        flex: 1, maxWidth: 780, width: '100%', margin: '0 auto',
        padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {rootIds.map(id => (
          <NodeCard key={id} nodeId={id} />
        ))}

        {rootIds.length === 0 && (
          <div style={{ marginTop: 80, textAlign: 'center', color: 'var(--ink-faint)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>∅</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
              no nodes yet — click "Add root" to get started
            </p>
          </div>
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)', padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 20,
        fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--mono)',
        background: 'var(--bg-deep)',
      }}>
        <span>+ child node</span>
        <span>⇢ link to node</span>
        <span>× delete subtree</span>
        <span style={{ marginLeft: 'auto' }}>cycle detection via DFS</span>
      </footer>
    </div>
  )
}

export default App
