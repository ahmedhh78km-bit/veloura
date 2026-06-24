import MenuItem from '../models/MenuItem.js';

// In-Memory Fallback Database
export let mockMenuItems = [
  {
    _id: "mock_burrata",
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
    _id: "mock_calamari",
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
    _id: "mock_seabass",
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
    _id: "mock_wagyu",
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
    _id: "mock_risotto",
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
    _id: "mock_fondant",
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
    _id: "mock_pannacotta",
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
    _id: "mock_oldfashioned",
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
    _id: "mock_peachpress",
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

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      let filtered = [...mockMenuItems];
      if (req.query.category) {
        filtered = filtered.filter(item => item.category === req.query.category);
      }
      if (req.query.available) {
        const availableOnly = req.query.available === 'true';
        filtered = filtered.filter(item => item.isAvailable === availableOnly);
      }
      return res.json(filtered);
    }

    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.available) {
      filter.isAvailable = req.query.available === 'true';
    }

    const menuItems = await MenuItem.find(filter);
    res.json(menuItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item details
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const item = mockMenuItems.find(i => i._id === req.params.id);
      if (item) {
        return res.json(item);
      } else {
        res.status(404);
        return next(new Error('Menu item not found (Mock Mode)'));
      }
    }

    const item = await MenuItem.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404);
      return next(new Error('Menu item not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isAvailable, tags, allergens, customizationOptions } = req.body;

    if (global.isMockDB) {
      const createdItem = {
        _id: 'mock_item_' + Date.now(),
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        tags: tags || [],
        allergens: allergens || [],
        customizationOptions: customizationOptions || []
      };
      mockMenuItems.push(createdItem);
      return res.status(201).json(createdItem);
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      tags: tags || [],
      allergens: allergens || [],
      customizationOptions: customizationOptions || []
    });

    const createdItem = await menuItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isAvailable, tags, allergens, customizationOptions } = req.body;

    if (global.isMockDB) {
      const itemIdx = mockMenuItems.findIndex(i => i._id === req.params.id);
      if (itemIdx !== -1) {
        const item = mockMenuItems[itemIdx];
        item.name = name !== undefined ? name : item.name;
        item.description = description !== undefined ? description : item.description;
        item.price = price !== undefined ? parseFloat(price) : item.price;
        item.category = category !== undefined ? category : item.category;
        item.image = image !== undefined ? image : item.image;
        item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;
        item.tags = tags !== undefined ? tags : item.tags;
        item.allergens = allergens !== undefined ? allergens : item.allergens;
        item.customizationOptions = customizationOptions !== undefined ? customizationOptions : item.customizationOptions;
        
        mockMenuItems[itemIdx] = item;
        return res.json(item);
      } else {
        res.status(404);
        return next(new Error('Menu item not found (Mock Mode)'));
      }
    }

    const item = await MenuItem.findById(req.params.id);

    if (item) {
      item.name = name || item.name;
      item.description = description || item.description;
      item.price = price !== undefined ? price : item.price;
      item.category = category || item.category;
      item.image = image || item.image;
      item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;
      item.tags = tags || item.tags;
      item.allergens = allergens || item.allergens;
      item.customizationOptions = customizationOptions || item.customizationOptions;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404);
      return next(new Error('Menu item not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const beforeLength = mockMenuItems.length;
      mockMenuItems = mockMenuItems.filter(i => i._id !== req.params.id);
      if (mockMenuItems.length < beforeLength) {
        return res.json({ message: 'Menu item removed successfully (Mock Mode)' });
      } else {
        res.status(404);
        return next(new Error('Menu item not found (Mock Mode)'));
      }
    }

    const item = await MenuItem.findById(req.params.id);

    if (item) {
      await MenuItem.deleteOne({ _id: req.params.id });
      res.json({ message: 'Menu item removed successfully' });
    } else {
      res.status(404);
      return next(new Error('Menu item not found'));
    }
  } catch (error) {
    next(error);
  }
};
