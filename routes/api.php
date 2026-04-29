<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
	Route::get('/user', [AuthController::class, 'user']);
	Route::post('/logout', [AuthController::class, 'logout']);

	// Cart (for authenticated users)
	Route::get('/cart', [CartController::class, 'index']);
	Route::post('/cart', [CartController::class, 'store']);
	Route::put('/cart/{productId}', [CartController::class, 'update']);
	Route::delete('/cart/{productId}', [CartController::class, 'destroy']);
	Route::delete('/cart', [CartController::class, 'clear']);

	// Category management (admin)
	Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
	Route::put('/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'update']);
	Route::delete('/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);

	Route::get('/orders', [OrderController::class, 'index']);
	Route::post('/orders', [OrderController::class, 'store']);
	Route::put('/orders/{id}', [OrderController::class, 'update']);

	Route::post('/products', [ProductController::class, 'store']);
	Route::put('/products/{id}', [ProductController::class, 'update']);
	Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});
