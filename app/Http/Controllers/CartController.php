<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getCartKey(Request $request)
    {
        // Use user ID if authenticated, otherwise use session ID
        return 'cart_' . ($request->user() ? $request->user()->id : session()->getId());
    }

    public function index(Request $request)
    {
        $cartKey = $this->getCartKey($request);
        $cart = cache()->get($cartKey, []);
        
        $productIds = array_keys($cart);
        if (empty($productIds)) {
            return response()->json(['items' => [], 'total' => 0]);
        }
        
        $products = Product::with('category')->whereIn('id', $productIds)->get();

        $items = $products->map(function ($product) use ($cart) {
            return [
                'product' => $product,
                'quantity' => $cart[$product->id],
            ];
        })->toArray();

        $total = array_reduce($items, function ($sum, $item) {
            return $sum + ($item['product']['price'] * $item['quantity']);
        }, 0);

        return response()->json([
            'items' => $items,
            'total' => $total,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cartKey = $this->getCartKey($request);
        $cart = cache()->get($cartKey, []);
        $productId = $request->product_id;
        $quantity = $request->quantity;

        if (isset($cart[$productId])) {
            $cart[$productId] += $quantity;
        } else {
            $cart[$productId] = $quantity;
        }

        // Store for 7 days
        cache()->put($cartKey, $cart, now()->addDays(7));

        return response()->json(['message' => 'Added to cart', 'cart' => $cart]);
    }

    public function update(Request $request, $productId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $cartKey = $this->getCartKey($request);
        $cart = cache()->get($cartKey, []);
        $quantity = $request->quantity;

        if ($quantity <= 0) {
            unset($cart[$productId]);
        } else {
            $cart[$productId] = $quantity;
        }

        cache()->put($cartKey, $cart, now()->addDays(7));

        return response()->json(['message' => 'Cart updated', 'cart' => $cart]);
    }

    public function destroy(Request $request, $productId)
    {
        $cartKey = $this->getCartKey($request);
        $cart = cache()->get($cartKey, []);
        unset($cart[$productId]);

        cache()->put($cartKey, $cart, now()->addDays(7));

        return response()->json(['message' => 'Removed from cart', 'cart' => $cart]);
    }

    public function clear(Request $request)
    {
        $cartKey = $this->getCartKey($request);
        cache()->forget($cartKey);
        return response()->json(['message' => 'Cart cleared']);
    }
}

