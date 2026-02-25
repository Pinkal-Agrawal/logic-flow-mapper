import React, { useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { addChild, deleteNode, setCondition, setLink } from '../store/logicSlice'
import { useCycleStatus } from '../hooks/useCycleStatus'

interface Props {
  nodeId: string
  depth?: number
}

export const NodeCard: React.FC<Props> = ({ nodeId, depth = 0 }) => {
  const dispatch = useAppDispatch()
  const node = useAppSelector(s => s.logic.nodes[nodeId])
  const allNodes = useAppSelector(s => s.logic.nodes)
  const isCycle = useCycleStatus(nodeId)
  const linkedNode = node?.linkedToId ? allNodes[node.linkedToId] : null

  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!node) return null

  const linkTargets = Object.values(allNodes).filter(n => n.id !== nodeId)
  const shortId = nodeId.replace('node_', '')

  return (
    <div style={{
      background: isCycle ? '#fff5f5' : 'var(--bg-card)',
      border: `1px solid ${isCycle ? '#fca5a5' : 'var(--border)'}`,
      borderLeft: `3px solid ${isCycle ? 'var(--danger)' : depth === 0 ? 'var(--accent)' : 'var(--border-strong)'}`,
      borderRadius: 12,
      boxShadow: isCycle ? '0 1px 3px #dc262610, 0 0 0 3px #fca5a520' : '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 10px 14px' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
          color: isCycle ? 'var(--danger)' : depth === 0 ? 'var(--accent)' : 'var(--ink-muted)',
          background: isCycle ? 'var(--danger-light)' : depth === 0 ? 'var(--accent-light)' : 'var(--bg-deep)',
          border: `1px solid ${isCycle ? 'var(--danger-border)' : depth === 0 ? 'var(--accent-border)' : 'var(--border)'}`,
          padding: '1px 7px', borderRadius: 99, whiteSpace: 'nowrap',
          minWidth: 32, textAlign: 'center', flexShrink: 0,
        }}>
          {isCycle ? '↺' : shortId}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={node.condition}
          placeholder="write your condition here…"
          className={`node-input${isCycle ? ' cycle' : ''}`}
          onChange={e => dispatch(setCondition({ id: nodeId, value: e.target.value }))}
        />

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <ActionBtn onClick={() => dispatch(addChild({ parentId: nodeId }))} title="add child" label="+" variant="add" />
          <ActionBtn onClick={() => setShowLinkPicker(v => !v)} title="link to node" label="⇢" variant="link" active={showLinkPicker || !!node.linkedToId} />
          <ActionBtn onClick={() => dispatch(deleteNode({ id: nodeId }))} title="delete" label="×" variant="del" />
        </div>
      </div>

      {isCycle && (
        <div style={{
          margin: '0 14px 10px', padding: '6px 10px',
          background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
          borderRadius: 6, fontSize: 11, color: 'var(--danger)',
          fontFamily: 'var(--mono)', display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span>↺</span> this node is part of a logic loop — unlink or delete to fix
        </div>
      )}

      {showLinkPicker && (
        <div style={{
          margin: '0 14px 10px', padding: '8px 10px',
          background: 'var(--bg-deep)', borderRadius: 6,
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--mono)' }}>link to →</span>
          <select
            className="link-select"
            value={node.linkedToId ?? ''}
            onChange={e => dispatch(setLink({ fromId: nodeId, toId: e.target.value || null }))}
          >
            <option value="">— none —</option>
            {linkTargets.map(n => (
              <option key={n.id} value={n.id}>
                {n.id.replace('node_', '#')} {n.condition ? `— ${n.condition.slice(0, 25)}` : '— (empty)'}
              </option>
            ))}
          </select>
          {linkedNode && (
            <span style={{
              fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--mono)',
              padding: '2px 8px', background: 'var(--accent-light)',
              borderRadius: 4, border: '1px solid var(--accent-border)',
            }}>
              → {linkedNode.condition?.slice(0, 22) || linkedNode.id}
            </span>
          )}
        </div>
      )}

      {node.childIds.length > 0 && (
        <div style={{
          paddingLeft: 32, paddingRight: 12, paddingBottom: 12,
          display: 'flex', flexDirection: 'column', gap: 8, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 17, top: 0, bottom: 12,
            width: 1, background: isCycle ? '#fca5a5' : 'var(--border)', borderRadius: 1,
          }} />
          {node.childIds.map(cid => (
            <div key={cid} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: -15, top: 19, width: 15,
                height: 1, background: isCycle ? '#fca5a5' : 'var(--border)',
              }} />
              <NodeCard nodeId={cid} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ActionBtnProps {
  onClick: () => void
  title?: string
  label: string
  variant: 'add' | 'link' | 'del'
  active?: boolean
}

const ActionBtn: React.FC<ActionBtnProps> = ({ onClick, title, label, variant, active }) => (
  <button onClick={onClick} title={title} className={`action-btn ${variant}${active ? ' on' : ''}`}>
    {label}
  </button>
)

export default NodeCard
