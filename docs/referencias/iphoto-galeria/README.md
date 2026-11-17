# Referencia: galería de iPhoto

Capturas de la interfaz de iPhoto para inventariar funcionalidades de la galería
(vista fotógrafo y vista cliente) y no olvidar ninguna.

Se toman como referencia de **funcionalidad**: el diseño, los textos y la marca son los nuestros.

## Cómo nombrar las capturas

`NN-vista-pantalla-detalle.png`, por ejemplo:

- `01-fotografo-listado-galerias.png`
- `02-fotografo-galeria-ajustes.png`
- `10-cliente-galeria-grid.png`
- `11-cliente-lightbox-favorito.png`

`vista` es `fotografo` o `cliente`. El número da el orden del recorrido.

## Inventario de funcionalidades

Se rellena a partir de las capturas. Cada funcionalidad se asigna a una tarea de
[FASES-IMPLEMENTACION.md](../../FASES-IMPLEMENTACION.md).

**Estado:** ✅ hecho · 🟡 parcial · ⬜ pendiente · ❓ por decidir

### 01 — Fotógrafo: listado de galerías

#### Tarjeta de galería

| # | Elemento | Qué hace | Tarea | Estado |
|---|---|---|---|---|
| 1 | Portada | Foto de portada de la galería | F3.6 | ⬜ |
| 2 | Título + nombre del cliente | Subtítulo con el cliente principal de la galería | F2.7 | 🟡 |
| 3 | Enviada | Indica si el enlace ya se envió al cliente | F2.8 | 🟡 |
| 4 | ♥ N | Selección del cliente; N = fotos seleccionadas en ese momento | F2.8 (indicador) · F5 (datos) | 🟡 (indicador; datos en su fase) |
| 5 | € | Galería pagada | F2.9 | 🟡 |
| 6 | Etiqueta | El cliente ha pedido productos extra | F2.8 (indicador) · F5.7 (extras) | 🟡 (indicador; datos en su fase) |
| 7 | @ | El cliente permite publicar las fotos | F2.8 (indicador) · F5.8 (consentimiento) | 🟡 (indicador; datos en su fase) |
| 8 | Descargar | Botón visible, **sin funcionalidad** por ahora | F2.8 · F6 | 🟡 (botón visible y desactivado; descarga en F6) |
| 9 | Email | Enviar el enlace de la galería al cliente por email | F2.10 | 🟡 |
| 10 | WhatsApp + | Enviar el enlace de la galería por WhatsApp | F2.10 | 🟡 |
| 11 | Archivar | Archivar desde la tarjeta | F2.8 | 🟡 |
| 12 | Eliminar | Eliminar desde la tarjeta (a la papelera) | F2.8 · F2.11 | 🟡 |

#### Listado

| Elemento | Qué hace | Tarea | Estado |
|---|---|---|---|
| Pestañas Activas / Archivadas / Papelera | Papelera = borrado reversible | F2.11 | 🟡 (hay borrador/publicada/archivada; sin papelera) |
| Filtros rápidos | Todas, Seleccionadas, Con extras, Pte. selección, Pagadas, Pte. pago, No enviadas, Descargadas | F2.12 | ⬜ |
| Buscar | Por título o cliente | F2.12 | ⬜ |
| Panel "Filtros" | Filtros avanzados | F2.12 | ❓ |
| Cambiar vista | Cuadrícula / lista | F2.12 | ⬜ |
| + Nueva | Crear galería | F2.1 | ✅ |

#### Menú lateral (módulos del producto de referencia)

| Módulo | Equivalente en nuestro plan | Estado |
|---|---|---|
| Galerías | F2–F6 | 🟡 |
| Calendarios | R1 (reservas) | ⬜ |
| Clientes / Proveedores | F4 (`ClientsListPage`) | ⬜ |
| Liberar espacio | F3 (gestión de almacenamiento R2) | ❓ |
| Sesiones | R1 (reservas confirmadas = sesiones) | ❓ |
| Contratos de cliente | Fuera del plan | ❓ |
| Plantillas | F7 (plantillas de email/mensajes) | ❓ |
| Facturación | Fuera del plan (R2 cubre la señal) | ❓ |
| CRM | Fuera del plan | ❓ |
| Herramientas / Tutoriales | Fuera del plan | ❓ |
