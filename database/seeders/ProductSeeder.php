<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $placeholderImage = '/images/product-placeholder.svg';

        $shoes = Category::where('name', 'Shoes')->first();
        $socks = Category::where('name', 'Socks')->first();
        $shirt = Category::where('name', 'Shirt')->first();
        $pants = Category::where('name', 'Pants')->first();
        $jewelry = Category::where('name', 'Jewelry')->first();
        $hat = Category::where('name', 'Hat')->first();
        $beauty = Category::where('name', 'Beauty Products')->first();

        $products = [
            [
                'name' => 'Nike Air Max',
                'description' => 'Comfortable running shoes',
                'price' => 120,
                'stock' => 10,
                'category_id' => $shoes->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Adidas Sneakers',
                'description' => 'Stylish everyday shoes',
                'price' => 95,
                'stock' => 15,
                'category_id' => $shoes->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Nike Crew Socks',
                'description' => 'Soft cotton crew socks',
                'price' => 12,
                'stock' => 50,
                'category_id' => $socks->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Adidas Ankle Socks',
                'description' => 'Breathable ankle socks',
                'price' => 10,
                'stock' => 40,
                'category_id' => $socks->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Classic White T-Shirt',
                'description' => 'Premium cotton tee',
                'price' => 25,
                'stock' => 30,
                'category_id' => $shirt->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Denim Jeans',
                'description' => 'Slim fit blue jeans',
                'price' => 60,
                'stock' => 20,
                'category_id' => $pants->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Gold Chain Necklace',
                'description' => 'Elegant 18k gold chain',
                'price' => 150,
                'stock' => 8,
                'category_id' => $jewelry->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Baseball Cap',
                'description' => 'Adjustable cotton cap',
                'price' => 20,
                'stock' => 25,
                'category_id' => $hat->id,
                'image' => $placeholderImage,
            ],
            [
                'name' => 'Moisturizing Cream',
                'description' => 'Hydrating face cream',
                'price' => 35,
                'stock' => 18,
                'category_id' => $beauty->id,
                'image' => $placeholderImage,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}

