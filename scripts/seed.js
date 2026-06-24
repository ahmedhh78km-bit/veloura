import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

dotenv.config();

const sampleMenuItems = [
  {
    name: "Truffle Burrata Bruschetta",
    description: "Crispy artisanal sourdough rubbed with garlic, topped with creamy burrata, heirloom cherry tomatoes, fresh basil, and a premium black truffle glaze.",
    price: 16.00,
    category: "appetizers",
    image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Signature", "Vegetarian"],
    allergens: ["Gluten", "Dairy"],
    customizationOptions: [
      {
        name: "Sourdough Type",
        options: ["Standard Sourdough", "Gluten-Free Artisan Bread"],
        additionalPrice: [0, 2.50]
      }
    ]
  },
  {
    name: "Crispy Calamari Fritti",
    description: "Tender calamari rings dusted with spiced semolina, flash-fried to golden perfection, served with house-made caper-lemon aioli and fresh herbs.",
    price: 18.50,
    category: "appetizers",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Seafood", "Crispy"],
    allergens: ["Shellfish", "Gluten"],
    customizationOptions: [
      {
        name: "Dip Selection",
        options: ["Caper-Lemon Aioli", "Spicy Marinara Sauce"],
        additionalPrice: [0, 0]
      }
    ]
  },
  {
    name: "Pan-Seared Chilean Sea Bass",
    description: "Flaky pan-seared Chilean sea bass nested on a bed of creamy saffron risotto, charred asparagus, and finished with a delicate lobster butter sauce.",
    price: 42.00,
    category: "mains",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Chef Special", "Gluten-Free"],
    allergens: ["Fish", "Dairy"],
    customizationOptions: [
      {
        name: "Doneness",
        options: ["Medium Tender", "Fully Seared"],
        additionalPrice: [0, 0]
      }
    ]
  },
  {
    name: "Aged Wagyu Truffle Burger",
    description: "8oz dry-aged Wagyu beef patty, melted gruyère cheese, caramelized onion compote, and wild truffle mayonnaise served on a toasted artisanal brioche bun with hand-cut parmesan fries.",
    price: 32.00,
    category: "mains",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Best Seller"],
    allergens: ["Gluten", "Dairy"],
    customizationOptions: [
      {
        name: "Meat Temperature",
        options: ["Medium Rare", "Medium", "Medium Well", "Well Done"],
        additionalPrice: [0, 0, 0, 0]
      },
      {
        name: "Add Extra Topping",
        options: ["None", "Crispy Pancetta", "Fried Organic Egg"],
        additionalPrice: [0, 3.00, 2.50]
      }
    ]
  },
  {
    name: "Forest Mushroom Saffron Risotto",
    description: "Simmered Arborio rice with a rich vegetable broth infusion, fresh saffron threads, local wild chanterelles, finished with grated aged Parmigiano-Reggiano.",
    price: 24.50,
    category: "mains",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Vegetarian", "Gluten-Free"],
    allergens: ["Dairy"],
    customizationOptions: [
      {
        name: "Vegan Option",
        options: ["Standard (With Butter & Cheese)", "Vegan (Coconut Oil & Nutritional Yeast)"],
        additionalPrice: [0, 1.50]
      }
    ]
  },
  {
    name: "Warm Chocolate Lava Fondant",
    description: "Decadent dark chocolate cake with a molten liquid center, served alongside house-spun Madagascar vanilla bean gelato and fresh raspberries.",
    price: 12.00,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Sweet", "Classic"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    customizationOptions: []
  },
  {
    name: "Artisanal Pistachio Panna Cotta",
    description: "Silky, chilled Italian cream infused with roasted Sicilian pistachios, layered with a sweet wild berry coulis and crushed praline nuts.",
    price: 11.50,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Nutty", "Cold"],
    allergens: ["Dairy", "Nuts"],
    customizationOptions: []
  },
  {
    name: "Smoked Rosemary Old Fashioned",
    description: "Premium rye whiskey, bitters, and orange peel syrup, infused in-house with real rosemary smoke under a glass dome.",
    price: 15.00,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Alcoholic", "Craft Cocktail"],
    allergens: [],
    customizationOptions: [
      {
        name: "Whiskey Choice",
        options: ["House Rye Whiskey", "Woodford Reserve Bourbon"],
        additionalPrice: [0, 4.00]
      }
    ]
  },
  {
    name: "Hibiscus Peach Ginger Press",
    description: "Sparkling cold-pressed peach juice infused with red hibiscus tea leaves, grated ginger, topped with fresh mint sprigs.",
    price: 8.50,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600",
    isAvailable: true,
    tags: ["Mocktail", "Refreshing"],
    allergens: [],
    customizationOptions: []
  }
];

const seedDB = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();
    console.log('Existing database records cleared.');

    // Seed Admin user
    const adminUser = new User({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD, // Will be hashed via User.pre('save')
      role: 'admin'
    });
    await adminUser.save();
    console.log(`Admin user seeded: ${process.env.ADMIN_USERNAME}`);

    // Seed Menu Items
    await MenuItem.insertMany(sampleMenuItems);
    console.log(`${sampleMenuItems.length} Menu Items seeded successfully!`);

    // Create a sample order to populate the dashboard stats immediately
    const sampleOrder = new Order({
      orderNumber: `ORD-${Date.now().toString().slice(-6)}-1123`,
      customerName: "Jane Doe",
      customerEmail: "jane.doe@example.com",
      customerPhone: "+15550199",
      orderType: "delivery",
      deliveryAddress: {
        street: "123 Gourmet Ave",
        city: "Culinary City",
        postalCode: "10001"
      },
      items: [
        {
          menuItemId: new mongoose.Types.ObjectId(), // Placeholders (will link properly if needed, but fine for initial stats)
          name: "Aged Wagyu Truffle Burger",
          quantity: 2,
          price: 32.00,
          selectedCustomizations: [
            { name: "Meat Temperature", selected: "Medium Rare", extraPrice: 0 }
          ]
        },
        {
          menuItemId: new mongoose.Types.ObjectId(),
          name: "Warm Chocolate Lava Fondant",
          quantity: 1,
          price: 12.00,
          selectedCustomizations: []
        }
      ],
      subtotal: 76.00,
      tax: 7.60,
      deliveryFee: 5.00,
      total: 88.60,
      paymentStatus: "paid",
      orderStatus: "completed",
      notes: "Please leave the package at the front door."
    });
    await sampleOrder.save();
    console.log('Sample completed order seeded for dashboard statistics!');

    console.log('Database seeding process complete.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
