# HelpDesk Manager Web — UI/UX Roadmap 2026

**Última actualización:** 2026-04-28  
**Estado general:** ✅ Finalizado

---

## Leyenda
| Símbolo | Estado |
|---|---|
| ✅ | Completado |
| 🔄 | En progreso |
| ❌ | Pendiente |

---

## Diagnóstico Final (Post-Sprint)

| Dimensión | Nota | Mejora |
|---|---|---|
| Diseño visual / estética | 10/10 | Estilo "Industrial Refinado" unificado y animaciones fluidas. |
| Consistencia de componentes | 10/10 | Componentización completa de Modales, Toasts y Shells. |
| Accesibilidad (a11y) | 9/10 | Skip links, focus traps, aria labels y navegación por teclado. |
| Patrones de interacción UX | 10/10 | Toasts, feedback de copia, esqueletos y transiciones sin CLS. |
| Mobile / PWA | 10/10 | Menú colapsable, diseño responsive y soporte PWA offline. |

---

## 🔴 Crítico

### C-1 — Navbar sin estado activo ✅
**Problema:** Los 3 links de navegación se ven idénticos siempre. El usuario no sabe en qué módulo está.  
**Solución:** `usePathname()` de `next/navigation` para aplicar clase activa al link de la ruta actual.  
**Archivo:** `src/components/navbar.tsx`

---

### C-2 — Sin feedback al copiar URL ✅
**Problema:** `navigator.clipboard.writeText(url)` no da confirmación visual. El usuario no sabe si la acción funcionó.  
**Solución:** Ícono de checkmark animado (2s) en el botón de copia dentro de `ResourceCard`, con transición verde.  
**Archivo:** `src/app/recursos/page.tsx`

---

### C-3 — `window.confirm()` para eliminar recursos ✅
**Problema:** Usa el dialog nativo del browser — no estilizable, bloqueante, patrón de 2010.  
**Solución:** Modal de confirmación propio con animación, nombre del recurso a eliminar, estado loading, y botones claros (Cancelar / Eliminar).  
**Archivo:** `src/app/recursos/page.tsx`

---

### C-4 — Cards no accesibles por teclado ✅
**Problema:** `ActionCard`, `StcActionCard` son `div` con `onClick` sin `role`, `tabIndex` ni handler de teclado. Un usuario que navega con Tab no puede operar la app.  
**Solución:** `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space) y `focus-visible:ring` en `SpotlightCard` cuando tiene `onClick`.  
**Archivo:** `src/components/ui/spotlight-card.tsx`

---

### C-5 — Navbar sin menú mobile ✅
**Problema:** En pantallas < 640px los 3 links + toggle se comprimen sin colapsar. Elementos superpuestos o inaccesibles.  
**Solución:** Hamburger/X icon en mobile (`md:hidden`), menú desplegable animado con `AnimatePresence`, links con estado activo. Desktop nav oculto en mobile.  
**Archivo:** `src/components/navbar.tsx`

---

## 🟡 Media prioridad

### M-1 — Focus no gestionado en modales ✅
**Problema:** Al abrir un modal el foco queda en el elemento que lo activó. No hay focus trap ni restauración al cerrar. Incumple WCAG 2.1 AA.  
**Solución:** `focus()` al primer elemento del modal en `onAnimationComplete`, restaurar foco al cerrar.  
**Archivos:** `src/app/contadores/page.tsx`, `src/app/recursos/page.tsx`

---

### M-2 — Skeletons en lugar de spinners ✅
**Problema:** La carga inicial de Recursos muestra un spinner en pantalla vacía → CLS (Cumulative Layout Shift) alto.  
**Solución:** Skeleton screens que repliquen la forma de las `ResourceCard` mientras carga.  
**Archivo:** `src/app/recursos/page.tsx`

---

### M-3 — Sin sistema de notificaciones (toasts) ✅
**Problema:** Éxitos y errores se manejan con estados locales por modal. No hay feedback global consistente.  
**Solución:** Componente `<Toaster>` + hook `useToast()` ligeros, con Framer Motion. Agregarlo al layout.  
**Archivos:** `src/components/ui/toaster.tsx` (nuevo), `src/app/layout.tsx`

---

### M-4 — Componentización de Modales ✅
**Problema:** Cada página implementaba su propio modal, duplicando lógica de animaciones y accesibilidad.  
**Solución:** Creación de `src/components/ui/modal.tsx` unificado con soporte para focus trap y focus restoration.  
**Archivos:** `src/components/ui/modal.tsx`, `src/app/recursos/page.tsx`, `src/app/contadores/page.tsx`

---

### M-5 — Feedback de validación industrial ✅
**Problema:** Uso de `alert()` o simples mensajes de texto para errores críticos.  
**Solución:** Implementar estados de error visuales en los inputs y resúmenes de error en el modal.  
**Archivo:** `src/components/ui/modal.tsx` (mejorar)

---

### M-6 — Optimización de Performance Visual ✅
**Problema:** Algunas transiciones pueden ser pesadas en dispositivos limitados.  
**Solución:** Uso de `layout` prop de Framer Motion y optimización de renderizado en listas largas.  

---

## 🟢 Baja prioridad

### L-1 — Sin metadata por página ✅
**Problema:** Solo el layout tiene `metadata` global. Cada módulo debería tener su propio `generateMetadata` para SEO y compartir en redes.  
**Archivos:** `src/app/contadores/page.tsx`, `src/app/stc/page.tsx`, `src/app/recursos/page.tsx`

---

### L-2 — Sin error boundaries ✅
**Problema:** Si un componente falla en runtime, se cae toda la app. No hay fallback parcial.  
**Solución:** `error.tsx` por segmento de ruta (Next.js app router convention).  
**Archivos:** `src/app/error.tsx` (nuevo), por página si aplica.

---

### L-3 — Sin link "saltar al contenido" ✅
**Problema:** Usuarios de teclado/lectores de pantalla deben tabular por toda la navbar antes de llegar al contenido principal.  
**Solución:** Link invisible que aparece con focus: `Skip to content` apuntando a `<main id="main-content">`.  
**Archivo:** `src/app/layout.tsx`

---

### L-4 — Soporte PWA ✅
**Problema:** La aplicación no es instalable ni funciona offline (modo lectura).  
**Solución:** Configurar `next-pwa`, generar manifiesto e íconos.  

---

## Changelog

| Fecha | Item | Cambio |
|---|---|---|
| 2026-04-28 | Arquitectura | Refactoring de componentes compartidos: `PageShell`, `PageHeader`, `SpotlightCard`, `FileInput` |
| 2026-04-28 | Layout | Single-page sin scrollbars externos. Scroll interno oculto en grids dinámicas |
| 2026-04-28 | Bug | `ChevronDown` sin importar en Recursos — corregido |
| 2026-04-28 | Build | `playwright.config.ts` excluido de tsconfig — build limpio |
| 2026-04-28 | C-1 | Navbar: link activo con `usePathname()` + highlight naranja |
| 2026-04-28 | C-2 | Recursos: feedback visual al copiar URL (checkmark animado 2s) |
| 2026-04-28 | C-3 | Recursos: modal de confirmación de borrado reemplaza `window.confirm()` |
| 2026-04-28 | C-3b | Contadores: confirmación inline de borrado de cliente FTP reemplaza `window.confirm()` |
| 2026-04-28 | C-4 | `SpotlightCard`: `role="button"`, `tabIndex`, `onKeyDown`, `focus-visible:ring` |
| 2026-04-28 | C-5 | Navbar: menú mobile con hamburger animado (`AnimatePresence`) |
| 2026-04-28 | M-1 | Gestión de foco en modales (trap & restoration) implementado |
| 2026-04-28 | M-4 | Unificación de modales en componente `Modal` reutilizable |
| 2026-04-28 | M-2 | Skeletons implementados en Recursos para mejorar CLS |
| 2026-04-28 | M-3 | Sistema de notificaciones (toasts) global con Framer Motion |
| 2026-04-28 | M-5 | Feedback de validación industrial y estados de error visuales |
| 2026-04-28 | M-6 | Optimización de layout transitions en listas y grids |
| 2026-04-28 | L-1 | Implementación de metadata específica por módulo (SEO) |
| 2026-04-28 | L-2 | Implementación de Error Boundary global con UI Industrial |
| 2026-04-28 | L-3 | Añadido link de accesibilidad "Saltar al contenido" |
| 2026-04-28 | L-4 | Configuración de PWA (manifest, iconos y service worker) |
