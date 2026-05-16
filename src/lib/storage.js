import { openDB } from 'idb'

const DB_NAME = 'po-agent'
const DB_VERSION = 1
const STORE = 'handles'
const WORKSPACE_KEY = 'workspace'

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE)
    },
  })
}

export async function saveWorkspaceHandle(handle) {
  const db = await getDB()
  await db.put(STORE, handle, WORKSPACE_KEY)
}

export async function loadWorkspaceHandle() {
  const db = await getDB()
  return db.get(STORE, WORKSPACE_KEY)
}

export async function clearWorkspaceHandle() {
  const db = await getDB()
  await db.delete(STORE, WORKSPACE_KEY)
}
