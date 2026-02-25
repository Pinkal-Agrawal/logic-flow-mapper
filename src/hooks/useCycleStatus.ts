import { useAppSelector } from '../store'

export function useCycleStatus(nodeId: string) {
  const cycleIds = useAppSelector(s => s.logic.cycleNodeIds)
  return cycleIds.includes(nodeId)
}
