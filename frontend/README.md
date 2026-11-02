# CanchaYa · Frontend

Interfaz web de CanchaYa para reservar canchas de fútbol desde el celular o el computador. Se compila dentro del jar de Spring Boot y se despliega junto con la API (ver el [README principal](../README.md)).

## Tecnologías

React 19 · Vite · TypeScript · React Router · TanStack Query · Axios · Tailwind CSS · React Hook Form + Zod · Sonner (toasts)

## Desarrollo

Requisitos: Node 20 o superior y el backend corriendo en `http://localhost:8080`.

```bash
npm install
npm run dev
```

Vite levanta `http://localhost:5173` y redirige las llamadas a `/api` hacia el backend, así que no hace falta configurar CORS.

`npm run build` genera el frontend en `../src/main/resources/static`, de donde lo sirve Spring Boot. Si alguna vez la API vive en otro dominio, defina `VITE_API_URL` antes del build.

### Cuentas de prueba

| Rol | Email | Contraseña |
| --- | --- | --- |
| Cliente | `cliente@canchaya.com` | `Cliente123*` |
| Admin | `admin@canchaya.com` | `Admin123*` |

## Pantallas

| Pantalla | Ruta | Acceso |
| --- | --- | --- |
| Inicio | `/` | Público |
| Ingresar | `/login` | Público |
| Crear cuenta | `/registro` | Público |
| Canchas | `/canchas` | Cliente |
| Reservar | `/canchas/:id` | Cliente |
| Mis reservas | `/mis-reservas` | Cliente |
| Resumen del día | `/admin` | Admin |
| Gestión de canchas | `/admin/canchas` | Admin |
| Gestión de reservas | `/admin/reservas` | Admin |

## Flujo de reserva

1. En **Canchas** el cliente elige una cancha (filtro por tipo).
2. En **Reservar** escoge el día en la tira de fechas (o con el calendario) y la app consulta `/disponibilidad`.
3. Toca la hora de inicio y la de fin (hasta 3 horas seguidas). Las franjas libres son verdes, las ocupadas o pasadas grises y las seleccionadas azules; el total se actualiza en vivo.
4. Confirma en el modal y ve el mensaje de éxito con el botón "Ver mis reservas".

## Decisiones de diseño

- **Mobile first:** todo funciona desde 360 px de ancho; la barra con el total queda fija abajo, al alcance del pulgar.
- **Siempre hay respuesta:** cada consulta muestra estado de carga, error con botón de reintentar o estado vacío; cada acción termina en un toast.
- **Errores en lenguaje humano:** `utils/errors.ts` traduce los errores de la API. Un `409` al reservar se muestra como "Alguien acaba de reservar esa hora, elige otra." y la disponibilidad se recarga sola.
- **Confirmación antes de reservar y cancelar**, mostrando cancha, fecha, horario y precio.
- **Sesión:** el token JWT vive en memoria y en `localStorage`; un interceptor de Axios lo agrega a cada petición y, ante un `401`, cierra la sesión y lleva a `/login`.
- **Mismo origen:** en producción frontend y API se sirven desde el mismo servidor; el cliente Axios usa rutas relativas (`/api/...`).
- **Rutas por rol:** las rutas de cliente y de admin están protegidas según el rol de la sesión. El panel de administración se descarga solo cuando un admin lo abre.
- **Accesibilidad:** etiquetas en todos los campos, foco visible, botones de al menos 44 px, modales que cierran con Escape y franjas con descripción para lectores de pantalla.

## Estructura

```
src
├── api          # cliente Axios, interceptores, endpoints y tipos
├── components   # Button, Modal, SlotPicker, CanchaCard, Layout…
├── features
│   ├── auth     # login, registro y contexto de sesión
│   ├── home
│   ├── canchas  # listado y pantalla de reserva
│   ├── reservas # mis reservas y cancelación
│   └── admin    # resumen, gestión de canchas y de reservas
├── hooks        # useAuth, useDisponibilidad
├── routes       # router y rutas protegidas
└── utils        # formato de moneda (COP), fechas y errores
```
