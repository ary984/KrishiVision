const LOCAL_SCANS_KEY = 'krishivision_local_scans'
const SCANS_CLEARED_AT_KEY = 'krishivision_scans_cleared_at'

function parseJson(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function toISOStringOrNull(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeScan(scan) {
  const createdAt = toISOStringOrNull(scan.created_at || scan.createdAt) || new Date().toISOString()
  return {
    id: scan.id || `local-${createdAt}`,
    filename: scan.filename || 'Crop Sample',
    crop_type: scan.crop_type || scan.cropType || scan.crop || null,
    disease: scan.disease || 'Healthy',
    confidence: scan.confidence,
    recommendation: scan.recommendation || '',
    created_at: createdAt,
    image_url: scan.image_url || scan.imageUrl || scan.image || null,
  }
}

function timestamp(value) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function sortByNewest(scans) {
  return scans.slice().sort((a, b) => timestamp(b.created_at) - timestamp(a.created_at))
}

export function getScansClearedAt() {
  return toISOStringOrNull(localStorage.getItem(SCANS_CLEARED_AT_KEY))
}

export function getLocalScans() {
  const items = parseJson(localStorage.getItem(LOCAL_SCANS_KEY), [])
  if (!Array.isArray(items)) return []
  return sortByNewest(items.map(normalizeScan))
}

export function saveLocalScan(scan) {
  const normalized = normalizeScan(scan)
  const existing = getLocalScans().filter((item) => item.id !== normalized.id)
  localStorage.setItem(LOCAL_SCANS_KEY, JSON.stringify(sortByNewest([normalized, ...existing])))
}

export function clearAllScans() {
  localStorage.setItem(LOCAL_SCANS_KEY, JSON.stringify([]))
  localStorage.setItem(SCANS_CLEARED_AT_KEY, new Date().toISOString())
}

export function clearAccountData() {
  clearAllScans()
  localStorage.removeItem('krishivision_settings')
  localStorage.removeItem('krishivision_demo_auth')
}

export function getMergedScans(remoteScans = []) {
  const clearedAt = getScansClearedAt()
  const clearedTimestamp = timestamp(clearedAt)

  const normalizedRemote = (Array.isArray(remoteScans) ? remoteScans : [])
    .map(normalizeScan)
    .filter((scan) => timestamp(scan.created_at) > clearedTimestamp)

  const localScans = getLocalScans().filter(
    (scan) => timestamp(scan.created_at) > clearedTimestamp
  )

  const byId = new Map()
  normalizedRemote.forEach((scan) => byId.set(scan.id, scan))
  localScans.forEach((scan) => {
    const existing = byId.get(scan.id)
    if (!existing) {
      byId.set(scan.id, scan)
      return
    }
    byId.set(scan.id, {
      ...existing,
      ...scan,
      image_url: scan.image_url || existing.image_url || null,
    })
  })

  return sortByNewest(Array.from(byId.values()))
}
