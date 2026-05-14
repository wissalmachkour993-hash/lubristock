'use client'

import { useEffect } from 'react'

/**
 * Enregistre le service worker en production (ou en dev si `NEXT_PUBLIC_PWA_DEV=1`).
 * Sans ce flag, utilisez `next build && next start` pour tester le SW sans HMR.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const pwaEnabled =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_PWA_DEV === '1'

    // En dev, si le SW n'est pas explicitement activé, on le désenregistre pour éviter
    // les erreurs de chunks/overlay (HMR) et des comportements inattendus.
    if (!pwaEnabled) {
      void (async () => {
        try {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map((r) => r.unregister()))
        } catch {
          // noop
        }
      })()
      return
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
      } catch (err) {
        console.warn('[PWA] Service worker registration failed:', err)
      }
    }

    void register()
  }, [])

  return null
}
