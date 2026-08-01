import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from './firebase.js'
import { loadStore, saveStore, normalizeStore, createRun } from './storage/storage.js'

const WRITE_DEBOUNCE_MS = 600

/**
 * Persistence for the whole store ({ activeRunId, runs }).
 * - Signed in (Firebase enabled): live-synced to Firestore users/{uid}.
 * - Otherwise: localStorage.
 *
 * Exposes the active run plus actions that operate on it, and run management
 * (create / select / rename / delete).
 */
export function useStore(user) {
  const [store, setStore] = useState(() => normalizeStore(null))
  const [ready, setReady] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const cloud = Boolean(user && firebaseEnabled)
  const storeRef = useRef(store) // always-current snapshot for debounced writes
  const writeTimer = useRef(null)

  const applyStore = useCallback((next) => {
    storeRef.current = next
    setStore(next)
  }, [])

  // Load (local) or subscribe (cloud) whenever the signed-in user changes.
  useEffect(() => {
    setReady(false)

    if (!cloud) {
      applyStore(loadStore())
      setReady(true)
      return undefined
    }

    const ref = doc(db, 'users', user.uid)
    let seeded = false
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          applyStore(normalizeStore(snap.data()))
          setReady(true)
        } else if (!seeded) {
          seeded = true
          const local = loadStore()
          applyStore(local)
          setDoc(ref, local).catch((e) => console.error('Failed to seed cloud data:', e))
          setReady(true)
        }
      },
      (err) => {
        console.error('Firestore subscription failed, falling back to local:', err)
        applyStore(loadStore())
        setReady(true)
      },
    )
    return unsub
  }, [cloud, user?.uid, applyStore])

  const scheduleWrite = useCallback(() => {
    if (cloud) {
      setSyncing(true)
      if (writeTimer.current) clearTimeout(writeTimer.current)
      writeTimer.current = setTimeout(() => {
        setDoc(doc(db, 'users', user.uid), storeRef.current)
          .catch((e) => console.error('Cloud save failed:', e))
          .finally(() => setSyncing(false))
      }, WRITE_DEBOUNCE_MS)
    } else {
      saveStore(storeRef.current)
    }
  }, [cloud, user?.uid])

  // Commit a whole new store: update ref synchronously, then persist.
  const commit = useCallback(
    (next) => {
      storeRef.current = next
      setStore(next)
      scheduleWrite()
    },
    [scheduleWrite],
  )

  const updateActiveRun = useCallback(
    (fn) => {
      const cur = storeRef.current
      const active = cur.runs[cur.activeRunId]
      if (!active) return
      const nextRun = fn(active)
      commit({ ...cur, runs: { ...cur.runs, [cur.activeRunId]: nextRun } })
    },
    [commit],
  )

  // --- active-run mutations ---
  const mutateChampions = useCallback(
    (fn) => updateActiveRun((run) => ({ ...run, champions: fn(run.champions) })),
    [updateActiveRun],
  )
  const setCompletionMode = useCallback(
    (mode) => updateActiveRun((run) => ({ ...run, completionMode: mode })),
    [updateActiveRun],
  )
  const setClassFilter = useCallback(
    (classFilter) => updateActiveRun((run) => ({ ...run, classFilter })),
    [updateActiveRun],
  )
  const resetActiveRun = useCallback(
    () => updateActiveRun((run) => ({ ...run, champions: {} })),
    [updateActiveRun],
  )

  // --- run management ---
  const selectRun = useCallback(
    (id) => {
      const cur = storeRef.current
      if (!cur.runs[id] || id === cur.activeRunId) return
      commit({ ...cur, activeRunId: id })
    },
    [commit],
  )
  const addRun = useCallback(
    (name, opts) => {
      const cur = storeRef.current
      const run = createRun(name, opts)
      commit({ ...cur, activeRunId: run.id, runs: { ...cur.runs, [run.id]: run } })
      return run.id
    },
    [commit],
  )
  const renameRun = useCallback(
    (id, name) => {
      const cur = storeRef.current
      if (!cur.runs[id]) return
      commit({ ...cur, runs: { ...cur.runs, [id]: { ...cur.runs[id], name } } })
    },
    [commit],
  )
  const deleteRun = useCallback(
    (id) => {
      const cur = storeRef.current
      if (!cur.runs[id]) return
      const runs = { ...cur.runs }
      delete runs[id]
      let activeRunId = cur.activeRunId
      if (activeRunId === id) activeRunId = Object.keys(runs)[0]
      if (!activeRunId) {
        const r = createRun()
        runs[r.id] = r
        activeRunId = r.id
      }
      commit({ ...cur, activeRunId, runs })
    },
    [commit],
  )

  const setRiotAccount = useCallback(
    (riotAccount) => commit({ ...storeRef.current, riotAccount }),
    [commit],
  )

  const activeRun = store.runs[store.activeRunId] ?? null
  const runList = Object.values(store.runs).sort((a, b) => a.createdAt - b.createdAt)

  return {
    activeRun,
    activeRunId: store.activeRunId,
    runList,
    riotAccount: store.riotAccount ?? null,
    selectRun,
    addRun,
    renameRun,
    deleteRun,
    setRiotAccount,
    mutateChampions,
    setCompletionMode,
    setClassFilter,
    resetActiveRun,
    ready,
    syncing,
  }
}
