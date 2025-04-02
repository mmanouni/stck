# Test API endpoints
$baseUrl = "http://localhost:5000/api"
$token = "" # We'll get this after login

# Function to make API calls
function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$RequireAuth = $true
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($RequireAuth -and $token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    $url = "$baseUrl$Endpoint"
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json)
        }
        
        Write-Host "`nTesting $Method $Endpoint"
        Write-Host "Status Code: $($response.StatusCode)"
        Write-Host "Response: $($response.Content)"
        Write-Host "----------------------------------------"
    } catch {
        Write-Host "`nError testing $Method $Endpoint"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Error Message: $($_.Exception.Message)"
        Write-Host "----------------------------------------"
    }
}

# Test login first to get token
Write-Host "Testing login..."
$loginBody = @{
    email = "test@example.com"
    password = "password123"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method "POST" -Headers @{"Content-Type"="application/json"} -Body ($loginBody | ConvertTo-Json)
    $token = ($loginResponse.Content | ConvertFrom-Json).token
    Write-Host "Login successful! Token received."
} catch {
    Write-Host "Login failed. Please check your credentials."
    exit
}

# Test inventory endpoints
Write-Host "`nTesting Inventory Endpoints..."
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory"
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/stats"
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/category-stats"
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/trends"

# Test product endpoints
Write-Host "`nTesting Product Endpoints..."
Invoke-ApiRequest -Method "GET" -Endpoint "/products"
Invoke-ApiRequest -Method "GET" -Endpoint "/products/search?query=test"
Invoke-ApiRequest -Method "GET" -Endpoint "/products/suggestions?query=test"

# Test creating a new product
$newProduct = @{
    name = "Test Product"
    description = "Test Description"
    price = 99.99
    quantity = 10
    category = "Test Category"
}

Invoke-ApiRequest -Method "POST" -Endpoint "/products" -Body $newProduct

# Test search functionality
Write-Host "`nTesting Search Functionality..."
Invoke-ApiRequest -Method "GET" -Endpoint "/products/search?query=Test"

Write-Host "`nAll tests completed!" 