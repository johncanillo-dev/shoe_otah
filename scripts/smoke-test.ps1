$ErrorActionPreference = 'Stop'

$login = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8000/api/login' -ContentType 'application/json' -Body '{"email":"admin@example.com","password":"password123"}'
$token = $login.token
$categories = Invoke-RestMethod -Method Get -Uri 'http://127.0.0.1:8000/api/categories'
$category = $categories[0]

$img1 = Join-Path $PSScriptRoot 'smoke-create.png'
$img2 = Join-Path $PSScriptRoot 'smoke-update.png'
$pngBytes = [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3Z5WQAAAAASUVORK5CYII=')
[IO.File]::WriteAllBytes($img1, $pngBytes)
[IO.File]::WriteAllBytes($img2, $pngBytes)

$createResponse = & curl.exe -s -X POST 'http://127.0.0.1:8000/api/products' -H 'Accept: application/json' -H "Authorization: Bearer $token" -F 'name=Smoke Test Shoe' -F 'description=Created via smoke test' -F 'price=49.99' -F 'stock=3' -F "category_id=$($category.id)" -F "image=@$img1"
$created = $createResponse | ConvertFrom-Json

$updateResponse = & curl.exe -s -X POST "http://127.0.0.1:8000/api/products/$($created.id)" -H 'Accept: application/json' -H "Authorization: Bearer $token" -F '_method=PUT' -F 'name=Smoke Test Shoe Updated' -F 'description=Updated via smoke test' -F 'price=59.99' -F 'stock=5' -F "category_id=$($category.id)" -F "image=@$img2"
$updated = $updateResponse | ConvertFrom-Json

[pscustomobject]@{
    createdId = $created.id
    createdName = $created.name
    createdImage = $created.image
    updatedName = $updated.name
    updatedPrice = $updated.price
    updatedImage = $updated.image
} | ConvertTo-Json -Depth 5
