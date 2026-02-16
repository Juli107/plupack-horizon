# Bitácora - Página Nosotros (PLUPack Horizon)

## Contexto y decisión técnica

- Se evaluó construir la página en React vs Liquid.
- Se decidió **Liquid nativo** para esta página por simplicidad, mantenibilidad, menor costo de build y mejor edición desde Theme Editor.
- Se mantiene coherencia visual con Home (paleta, noise, motion suave), pero sin 3D.

## Lineamientos de diseño acordados

- Fondo claro principal: `#DDE6ED`.
- Color tipográfico principal: `#146C90`.
- Conservar textura de noise usada en Home.
- Motion sutil y accesible (`prefers-reduced-motion`), sin dependencias pesadas.
- Página responsive en desktop/tablet/mobile.

## Cambios implementados

### 1) Hero de Nosotros

- Se creó la sección `sections/about-hero.liquid`.
- Estructura:
  - Eyebrow: "Sobre nosotros".
  - Título en tres líneas: "Soluciones / integrales en / embalaje".
  - Dos párrafos descriptivos.
  - Barra inferior con:
    - "CALIDAD GARANTIZADA"
    - "ENTREGA EFICIENTE"
    - "ASESORÍA CERCANA"
- Ajustes solicitados:
  - Eyebrow y barra inferior en fuente mono + uppercase.
  - Corrección de visibilidad/animación para evitar contenido oculto.
  - Balance de escala tipográfica para desktop y mobile.

### 2) Menú Liquid (navbar)

- Se agregó fallback para link de "Nosotros" (sin duplicar si ya existe en navegación):
  - `snippets/header-menu.liquid` (desktop).
  - `snippets/header-drawer.liquid` (mobile).

### 3) Sección "Nuestro propósito"

- Se creó `sections/about-purpose.liquid`.
- Layout editorial 2 columnas + imagen inferior full width.
- Se incorporó imagen dummy por defecto del repo (`industry-1.webp`) si no se selecciona una en editor.
- Se hizo afinado de jerarquía, contraste, espaciado y peso tipográfico.
- Corrección de título que colapsaba verticalmente.

### 4) Sección "Futuro"

- Se creó `sections/about-future.liquid`.
- Dirección editorial tipo awwwards:
  - Encabezado en dos columnas (título + intro).
  - Lista de 5 ejes con numeración `01–05`.
- Se quitó la interacción hover por solicitud (no aportaba valor).

### 5) Sección "Proyección y crecimiento"

- Se creó `sections/about-projection.liquid`.
- Layout split con borde (título a la izquierda, texto a la derecha), alineado al mock compartido.
- Responsive ajustado para apilar en mobile.

### 6) Prefooter

- Se creó `sections/about-prefooter.liquid`.
- Visual conectado a Home:
  - Gradiente azul.
  - Noise sutil.
  - Título "Embalajes / Sin límites" (segunda línea outline).
  - CTA primario y secundario.

## Template y orden de secciones

- Se creó/actualizó `templates/page.nosotros.json` con el flujo:
  1. `about_hero`
  2. `about_purpose`
  3. `about_future`
  4. `about_projection`
  5. `about_prefooter`

## Archivos tocados durante este trabajo

- `sections/about-hero.liquid`
- `sections/about-purpose.liquid`
- `sections/about-future.liquid`
- `sections/about-projection.liquid`
- `sections/about-prefooter.liquid`
- `templates/page.nosotros.json`
- `snippets/header-menu.liquid`
- `snippets/header-drawer.liquid`

## Observaciones

- Se hicieron iteraciones de jerarquía visual según feedback (peso del título, tamaños de labels, contraste y espaciado).
- Se priorizó mantener identidad visual de marca con un lenguaje más limpio/editorial.
- Pendiente natural: un pase final de polish visual global (espaciado vertical entre secciones y ajuste fino tipográfico por breakpoint).
