'use client'

import { useEffect, useRef, useCallback } from 'react'

interface TorrentProgress {
  id: string
  infoHash: string
  progress: number
  downloadSpeed: number
  uploadSpeed: number
  peers: number
  seeds: number
  status: string
}

interface UseTorrentOptions {
  onProgress?: (data: TorrentProgress) => void
  onDone?: (infoHash: string) => void
  onError?: (error: Error) => void
}

export function useTorrent(options: UseTorrentOptions = {}) {
  const clientRef = useRef<any>(null)
  const torrentsRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    let WebTorrent: any
    let client: any

    const init = async () => {
      try {
        const wt = await import('webtorrent')
        WebTorrent = wt.default
        client = new WebTorrent()
        clientRef.current = client

        client.on('error', (err: Error) => {
          console.error('WebTorrent error:', err)
          options.onError?.(err)
        })
      } catch (err) {
        console.error('Failed to init WebTorrent:', err)
      }
    }

    init()

    return () => {
      if (client) {
        client.destroy()
      }
    }
  }, [])

  const addMagnet = useCallback(async (
    torrentId: string,
    magnetLink: string,
    savePath: string
  ) => {
    const client = clientRef.current
    if (!client) return

    return new Promise((resolve, reject) => {
      const torrent = client.add(magnetLink, { path: savePath }, (t: any) => {
        torrentsRef.current.set(torrentId, t)
        resolve(t)

        t.on('download', () => {
          options.onProgress?.({
            id: torrentId,
            infoHash: t.infoHash,
            progress: t.progress,
            downloadSpeed: t.downloadSpeed,
            uploadSpeed: t.uploadSpeed,
            peers: t.numPeers,
            seeds: 0,
            status: 'DOWNLOADING',
          })

          // Update DB every 5 seconds
          updateTorrentDB(torrentId, {
            progress: t.progress,
            downloadSpeed: t.downloadSpeed,
            uploadSpeed: t.uploadSpeed,
            peers: t.numPeers,
            status: 'DOWNLOADING',
          })
        })

        t.on('done', () => {
          options.onDone?.(t.infoHash)
          options.onProgress?.({
            id: torrentId,
            infoHash: t.infoHash,
            progress: 1,
            downloadSpeed: 0,
            uploadSpeed: t.uploadSpeed,
            peers: t.numPeers,
            seeds: 0,
            status: 'SEEDING',
          })

          updateTorrentDB(torrentId, {
            progress: 1,
            downloadSpeed: 0,
            uploadSpeed: t.uploadSpeed,
            peers: t.numPeers,
            status: 'COMPLETED',
          })
        })

        t.on('error', (err: Error) => {
          options.onError?.(err)
          updateTorrentDB(torrentId, { status: 'ERROR' })
          reject(err)
        })
      })

      torrent.on('error', reject)
    })
  }, [options])

  const pauseTorrent = useCallback((torrentId: string) => {
    const t = torrentsRef.current.get(torrentId)
    if (t) {
      t.pause()
      updateTorrentDB(torrentId, { status: 'PAUSED' })
    }
  }, [])

  const resumeTorrent = useCallback((torrentId: string) => {
    const t = torrentsRef.current.get(torrentId)
    if (t) {
      t.resume()
      updateTorrentDB(torrentId, { status: 'DOWNLOADING' })
    }
  }, [])

  const removeTorrent = useCallback((torrentId: string, magnetLink: string) => {
    const client = clientRef.current
    const t = torrentsRef.current.get(torrentId)
    if (client && t) {
      client.remove(magnetLink, () => {
        torrentsRef.current.delete(torrentId)
      })
    }
  }, [])

  const seedFile = useCallback(async (
    file: File,
    jobId: string,
    onMagnet: (magnet: string, infoHash: string, name: string, size: number) => void
  ) => {
    const client = clientRef.current
    if (!client) return

    client.seed(file, (torrent: any) => {
      onMagnet(torrent.magnetURI, torrent.infoHash, torrent.name, torrent.length)
    })
  }, [])

  return { addMagnet, pauseTorrent, resumeTorrent, removeTorrent, seedFile }
}

// Helper to update torrent in DB
async function updateTorrentDB(id: string, data: Partial<TorrentProgress & { status: string }>) {
  try {
    await fetch(`/api/torrents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Failed to update torrent DB:', err)
  }
}
