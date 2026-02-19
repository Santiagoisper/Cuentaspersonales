$ErrorActionPreference = "Stop"

Write-Host "Actualizando repo local y configuracion de Vercel..."

# Evita proxies locales rotos en esta ejecucion.
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""
$env:GIT_HTTP_PROXY = ""
$env:GIT_HTTPS_PROXY = ""

git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) {
  throw "Fallo git pull."
}

vercel pull --yes
if ($LASTEXITCODE -ne 0) {
  throw "Fallo vercel pull."
}

Write-Host "Listo. Carpeta local y configuracion de Vercel actualizadas."
