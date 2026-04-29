<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('orderItems.product');

        if ($request->user() && ! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'contact_name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_phone' => 'required|string|max:30',
            'payment_method' => 'nullable|string|max:255',
        ]);

        // Get cart from cache using user ID
        $cartKey = 'cart_' . $request->user()->id;
        $cart = cache()->get($cartKey, []);

        if (empty($cart)) {
            return response()->json(['message' => 'Your cart is empty.'], 422);
        }

        $products = Product::whereIn('id', array_keys($cart))->get();

        if ($products->isEmpty()) {
            return response()->json(['message' => 'Unable to create order from an empty cart.'], 422);
        }

        $total = $products->sum(function ($product) use ($cart) {
            return $product->price * ($cart[$product->id] ?? 0);
        });

        $order = DB::transaction(function () use ($request, $products, $cart, $total) {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_price' => $total,
                'address' => $request->address,
                'contact_name' => $request->contact_name,
                'contact_phone' => $request->contact_phone,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_id' => null,
            ]);

            foreach ($products as $product) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $cart[$product->id],
                    'price' => $product->price,
                ]);
            }

            return $order->load('orderItems.product');
        });

        // Clear the cart
        cache()->forget('cart_' . $request->user()->id);

        return response()->json($order, 201);
    }

    public function update(Request $request, $id)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'nullable|string|max:50',
            'payment_id' => 'nullable|string|max:255',
        ]);

        $order->fill(array_filter($request->only(['status', 'payment_id'])));
        $order->save();

        return response()->json($order->load('orderItems.product'));
    }
}
