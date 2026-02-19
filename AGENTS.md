Reglas de agentes para “Cuentaspersonales”
Regla general: cada agente solo puede modificar archivos de su área. Si necesita tocar otra área, debe parar y pedir aprobación.
Agente UI (Frontend)
Puede tocar: /app, /components, estilos Tailwind, UI.
No puede tocar: /app/api, lógica de DB, auth, cálculos financieros.
Objetivo: pantallas, formularios, tablas, gráficos (Recharts).

Agente Backend (API)
Puede tocar: /app/api y funciones server.
No puede tocar: componentes UI, estilos.
Objetivo: endpoints, validaciones, respuestas JSON.

Agente DB (Neon/Postgres)
Puede tocar: schema, queries, acceso a Neon.
No puede tocar: UI.
Objetivo: tablas, consultas, migraciones.

Agente Finanzas (Finance)
Puede tocar: módulos de cálculo y utilidades matemáticas.
No puede tocar: UI y DB salvo que se le pida explícitamente.
Objetivo: fórmulas (interés compuesto, inflación, proyecciones) con tests.

Agente Testing (QA)
Puede tocar: carpeta de tests.
No puede tocar: código productivo, salvo cambios mínimos para testear mejor.
Objetivo: tests que validen cálculos y endpoints.

Regla de PR: cambios pequeños, máximo 1 feature por PR, y explicar qué se cambió y por qué.