import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { mockMenuItems } from './menuController.js';

// In-Memory Fallback Orders Database
let mockOrders = [
  {
    _id: "mock_order_1",
    orderNumber: "ORD-991234-1123",
    customerName: "Jane Doe",
    customerEmail: "jane.doe@example.com",
    customerPhone: "+1 (555) 019-9234",
    orderType: "delivery",
    deliveryAddress: {
      street: "123 Gourmet Ave",
      city: "Culinary City",
      postalCode: "10001"
    },
    items: [
      {
        menuItemId: "mock_wagyu",
        name: "Aged Wagyu Truffle Burger",
        quantity: 2,
        price: 32.00,
        selectedCustomizations: [
          { name: "Meat Temperature", selected: "Medium Rare", extraPrice: 0 }
        ]
      },
      {
        menuItemId: "mock_fondant",
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
    notes: "Please leave the package at the front door.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// @desc    Create a new order (with server-side price validation)
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res, next) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    orderType,
    deliveryAddress,
    items,
    notes
  } = req.body;

  try {
    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No items in order'));
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Loop items, query database/mock, validate and recalculate prices
    for (const orderItem of items) {
      let dbItem;
      if (global.isMockDB) {
        dbItem = mockMenuItems.find(i => i._id === orderItem.menuItemId);
      } else {
        dbItem = await MenuItem.findById(orderItem.menuItemId);
      }

      if (!dbItem) {
        res.status(404);
        return next(new Error(`Menu item not found: ${orderItem.menuItemId}`));
      }
      if (!dbItem.isAvailable) {
        res.status(400);
        return next(new Error(`Item is out of stock: ${dbItem.name}`));
      }

      // Calculate customization additional prices
      let itemCustomizationsCost = 0;
      const selectedCustomizations = [];

      if (orderItem.selectedCustomizations) {
        for (const cust of orderItem.selectedCustomizations) {
          const dbCustConfig = dbItem.customizationOptions.find(c => c.name === cust.name);
          let extraPrice = 0;
          if (dbCustConfig) {
            const optionIdx = dbCustConfig.options.indexOf(cust.selected);
            if (optionIdx !== -1 && dbCustConfig.additionalPrice && dbCustConfig.additionalPrice[optionIdx]) {
              extraPrice = dbCustConfig.additionalPrice[optionIdx];
            }
          }
          itemCustomizationsCost += extraPrice;
          selectedCustomizations.push({
            name: cust.name,
            selected: cust.selected,
            extraPrice
          });
        }
      }

      const singleItemPrice = dbItem.price + itemCustomizationsCost;
      const itemSubtotal = singleItemPrice * orderItem.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        menuItemId: dbItem._id,
        name: dbItem.name,
        quantity: orderItem.quantity,
        price: singleItemPrice,
        selectedCustomizations
      });
    }

    // Set fees
    const taxRate = 0.10; // 10% VAT
    const calculatedTax = parseFloat((calculatedSubtotal * taxRate).toFixed(2));
    const deliveryFee = orderType === 'delivery' ? 5.00 : 0.00;
    const calculatedTotal = parseFloat((calculatedSubtotal + calculatedTax + deliveryFee).toFixed(2));

    // Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (global.isMockDB) {
      const savedOrder = {
        _id: 'mock_order_' + Date.now(),
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        items: validatedItems,
        subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
        tax: calculatedTax,
        deliveryFee,
        total: calculatedTotal,
        paymentStatus: 'paid',
        orderStatus: 'placed',
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockOrders.push(savedOrder);
      return res.status(201).json(savedOrder);
    }

    const order = new Order({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      items: validatedItems,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      tax: calculatedTax,
      deliveryFee,
      total: calculatedTotal,
      paymentStatus: 'paid', // Pre-confirm payment for mockup
      orderStatus: 'placed',
      notes
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID or Order Number
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const order = mockOrders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
      if (order) {
        return res.json(order);
      } else {
        res.status(404);
        return next(new Error('Order not found (Mock Mode)'));
      }
    }

    const queryField = req.params.id.startsWith('ORD-') 
      ? { orderNumber: req.params.id }
      : { _id: req.params.id };

    const order = await Order.findOne(queryField).populate('items.menuItemId');
    if (order) {
      res.json(order);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      let filtered = [...mockOrders];
      if (req.query.status) {
        filtered = filtered.filter(o => o.orderStatus === req.query.status);
      }
      // Sort by newest first
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(filtered);
    }

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    if (global.isMockDB) {
      const orderIdx = mockOrders.findIndex(o => o._id === req.params.id);
      if (orderIdx !== -1) {
        const order = mockOrders[orderIdx];
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        order.updatedAt = new Date().toISOString();
        mockOrders[orderIdx] = order;
        return res.json(order);
      } else {
        res.status(404);
        return next(new Error('Order not found (Mock Mode)'));
      }
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard reports & aggregation metrics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const totalOrders = mockOrders.length;
      
      const paidOrders = mockOrders.filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
      
      const activeStates = ['placed', 'preparing', 'ready_for_pickup', 'out_for_delivery'];
      const activeOrders = mockOrders.filter(o => activeStates.includes(o.orderStatus)).length;
      
      const averageOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;
      
      const statusCounts = mockOrders.reduce((acc, o) => {
        acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
        return acc;
      }, {});

      // Calculate popular items
      const itemCounts = {};
      mockOrders.forEach(o => {
        o.items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });

      const popularItems = Object.keys(itemCounts).map(name => ({
        _id: name,
        totalQty: itemCounts[name]
      })).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);

      return res.json({
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        activeOrders,
        averageOrderValue,
        statusCounts,
        popularItems
      });
    }

    const totalOrders = await Order.countDocuments({});
    
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const activeOrders = await Order.countDocuments({
      orderStatus: { $in: ['placed', 'preparing', 'ready_for_pickup', 'out_for_delivery'] }
    });

    const averageOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      activeOrders,
      averageOrderValue,
      statusCounts: statusCounts.reduce((acc, current) => {
        acc[current._id] = current.count;
        return acc;
      }, {}),
      popularItems
    });
  } catch (error) {
    next(error);
  }
};
