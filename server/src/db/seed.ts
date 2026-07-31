import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './mongo';
import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Order from '../models/Order';
import Expense from '../models/Expense';
import Coupon from '../models/Coupon';
import Supplier from '../models/Supplier';
import PurchaseOrder from '../models/PurchaseOrder';
import NotificationSetting from '../models/NotificationSetting';

export const seedData = async () => {
  console.log('[Seed] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Expense.deleteMany({}),
    Coupon.deleteMany({}),
    Supplier.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    NotificationSetting.deleteMany({}),
  ]);

  console.log('[Seed] Creating users...');
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const customerPassword = await bcrypt.hash('customer123', salt);

  const admin = await User.create({
    name: 'Rajesh Sharma (Owner)',
    email: 'admin@procraft.com',
    phone: '+91 98765 43210',
    password: adminPassword,
    role: 'seller',
    address: 'ProCraft Hardware & Paint Studio, MG Road, Bangalore',
  });

  const customer1 = await User.create({
    name: 'John Verma',
    email: 'john@example.com',
    phone: '+91 98123 45678',
    password: customerPassword,
    role: 'customer',
    address: '42, Sunset Boulevard, Indiranagar, Bangalore - 560038',
  });

  const customer2 = await User.create({
    name: 'Sarah Iyer',
    email: 'sarah@example.com',
    phone: '+91 91234 56789',
    password: customerPassword,
    role: 'customer',
    address: '108, Palm Meadows, Whitefield, Bangalore - 560066',
  });

  console.log('[Seed] Creating categories...');
  const categories = await Category.insertMany([
    {
      name: 'Paint & Wood Care',
      slug: 'paint',
      icon: 'Palette',
      description: 'Premium interior emulsion, exterior weatherproof paint, wood finishes, and epoxy coatings.',
    },
    {
      name: 'Power & Hand Tools',
      slug: 'tools',
      icon: 'Hammer',
      description: 'Professional drills, angle grinders, mechanical toolsets, hammers, and measuring tape.',
    },
    {
      name: 'Hardware & Fasteners',
      slug: 'hardware',
      icon: 'Wrench',
      description: 'Heavy duty SS hinges, door locks, steel screw assortments, nuts, bolts, and padlocks.',
    },
    {
      name: 'Electrical & Wiring',
      slug: 'electrical',
      icon: 'Zap',
      description: 'FR PVC house wires, modular switchboards, LED flood lights, and circuit breakers.',
    },
    {
      name: 'Plumbing & Pipes',
      slug: 'plumbing',
      icon: 'Droplets',
      description: 'UPVC pipes, brass bib cocks, ball valves, water meters, and Teflon tapes.',
    },
    {
      name: 'Safety & Workwear',
      slug: 'safety',
      icon: 'ShieldCheck',
      description: 'Industrial N95 masks, steel-toe safety boots, goggles, and cut-resistant work gloves.',
    },
  ]);

  console.log('[Seed] Creating products...');
  const products = await Product.insertMany([
    // Paint & Wood Care
    {
      name: 'Asian Paints Royale Luxury Interior Emulsion - Morning Glory (20L)',
      slug: 'asian-paints-royale-luxury-20l',
      category: 'paint',
      brand: 'Asian Paints',
      price: 6850,
      costPrice: 5100,
      stockQuantity: 18,
      unit: 'liter',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
      description: 'Ultra sheen luxury interior paint with Teflon surface protector. Highly washable and stain resistant.',
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      name: 'Dulux Velvet Touch Pearl Glo - Ivory White (4L)',
      slug: 'dulux-velvet-touch-4l',
      category: 'paint',
      brand: 'Dulux',
      price: 2150,
      costPrice: 1600,
      stockQuantity: 24,
      unit: 'liter',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
      description: 'Smooth pearl glo finish for interior walls with anti-fungal properties and rich depth of color.',
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      name: 'Berger Exterior WeatherCoat Long Life (10L)',
      slug: 'berger-weathercoat-10l',
      category: 'paint',
      brand: 'Berger',
      price: 4300,
      costPrice: 3200,
      stockQuantity: 4, // LOW STOCK alert demo!
      unit: 'liter',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
      description: 'Heavy duty exterior paint formulated to withstand extreme rainfall and UV sunlight.',
      lowStockThreshold: 6,
      isActive: true,
    },
    {
      name: 'Epoxy Resin Clear Coat Hardener Kit (2 Kg)',
      slug: 'epoxy-resin-clear-coat-2kg',
      category: 'paint',
      brand: 'ProCraft',
      price: 1899,
      costPrice: 1250,
      stockQuantity: 15,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1541888946425-d0ebb18086f6?w=800&q=80',
      description: 'Crystal clear high gloss epoxy resin for wood tabletops, concrete floors, and waterproofing.',
      lowStockThreshold: 4,
      isActive: true,
    },
    // Power & Hand Tools
    {
      name: 'Bosch Professional 800W Rotary Hammer Drill',
      slug: 'bosch-rotary-hammer-drill',
      category: 'tools',
      brand: 'Bosch',
      price: 5499,
      costPrice: 3900,
      stockQuantity: 12,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
      description: 'Professional grade hammer drill with SDS-plus chuck, impact stop, and auxiliary handle.',
      lowStockThreshold: 3,
      isActive: true,
    },
    {
      name: 'Stanley 65-Piece Mechanical Tool Kit in Hard Case',
      slug: 'stanley-65-piece-tool-kit',
      category: 'tools',
      brand: 'Stanley',
      price: 3250,
      costPrice: 2400,
      stockQuantity: 20,
      unit: 'box',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      description: 'Comprehensive mechanical tool set including ratchets, sockets, wrenches, screwdrivers, and pliers.',
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      name: 'DeWalt 900W Heavy Duty Angle Grinder (4-inch)',
      slug: 'dewalt-angle-grinder-4in',
      category: 'tools',
      brand: 'DeWalt',
      price: 4100,
      costPrice: 3100,
      stockQuantity: 8,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
      description: 'High torque angle grinder for cutting steel, tiles, and grinding weld seams with safety guard.',
      lowStockThreshold: 3,
      isActive: true,
    },
    {
      name: 'ProCraft Forged Steel Claw Hammer with Fiberglass Handle',
      slug: 'procraft-claw-hammer',
      category: 'tools',
      brand: 'ProCraft',
      price: 650,
      costPrice: 420,
      stockQuantity: 35,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80',
      description: 'Ergonomic fiberglass handle claw hammer with vibration dampening and hardened steel head.',
      lowStockThreshold: 5,
      isActive: true,
    },
    // Hardware & Fasteners
    {
      name: 'SS 304 Heavy Duty Architectural Ball Bearing Hinges (Pair)',
      slug: 'ss304-ball-bearing-hinges',
      category: 'hardware',
      brand: 'Godrej',
      price: 480,
      costPrice: 310,
      stockQuantity: 50,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&q=80',
      description: 'Stainless steel 5-inch heavy door hinges with ultra smooth ball bearing movement.',
      lowStockThreshold: 10,
      isActive: true,
    },
    {
      name: 'Hardened Steel Screw & Wall Plug Assortment (1000 Pcs Box)',
      slug: 'steel-screw-assortment-1000pcs',
      category: 'hardware',
      brand: 'ProCraft',
      price: 850,
      costPrice: 550,
      stockQuantity: 40,
      unit: 'box',
      image: 'https://images.unsplash.com/photo-1516743603222-4217117abdd2?w=800&q=80',
      description: 'Organized plastic box containing countersunk screws, drywall screws, and nylon wall plugs.',
      lowStockThreshold: 8,
      isActive: true,
    },
    {
      name: 'Godrej Nav-Tal Heavy Brass 7-Lever Padlock with 3 Keys',
      slug: 'godrej-navtal-padlock',
      category: 'hardware',
      brand: 'Godrej',
      price: 1150,
      costPrice: 790,
      stockQuantity: 3, // LOW STOCK alert demo!
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
      description: 'Iconic high-security brass padlock with hardened steel shackle resistant to hacksaws and crowbars.',
      lowStockThreshold: 5,
      isActive: true,
    },
    // Electrical & Wiring
    {
      name: 'Finolex FR PVC Insulated Copper Wire 1.5 sq mm (90m Roll)',
      slug: 'finolex-copper-wire-90m',
      category: 'electrical',
      brand: 'Finolex',
      price: 2450,
      costPrice: 1850,
      stockQuantity: 16,
      unit: 'meter',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80',
      description: 'Flame retardant 99.9% pure copper house wiring cable with high insulation resistance.',
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      name: 'Legrand Mylinc 6A Modular Switches (Pack of 10)',
      slug: 'legrand-modular-switches-10pk',
      category: 'electrical',
      brand: 'Legrand',
      price: 750,
      costPrice: 500,
      stockQuantity: 30,
      unit: 'box',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      description: 'Sleek white modular switches tested for 1,00,000 clicks with fire-retardant polycarbonate housing.',
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      name: 'Philips LED Outdoor IP65 Flood Light (50W - Cool White)',
      slug: 'philips-led-flood-light-50w',
      category: 'electrical',
      brand: 'Philips',
      price: 1800,
      costPrice: 1280,
      stockQuantity: 10,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
      description: 'Waterproof outdoor floodlight for shop fronts, gardens, and warehouses with 5000 Lumens output.',
      lowStockThreshold: 4,
      isActive: true,
    },
    // Plumbing & Pipes
    {
      name: 'Ashirvad 1-inch UPVC High Pressure Ball Valve',
      slug: 'ashirvad-upvc-ball-valve-1in',
      category: 'plumbing',
      brand: 'Ashirvad',
      price: 340,
      costPrice: 210,
      stockQuantity: 45,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
      description: 'Corrosion resistant UPVC ball valve with smooth quarter-turn handle for residential water lines.',
      lowStockThreshold: 10,
      isActive: true,
    },
    {
      name: 'Supreme 1.5-inch Heavy Duty PVC Drainage Pipe (3 Meter length)',
      slug: 'supreme-pvc-pipe-3m',
      category: 'plumbing',
      brand: 'Supreme',
      price: 520,
      costPrice: 370,
      stockQuantity: 28,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80',
      description: 'ISO certified heavy drainage pipe with socket and rubber ring joint for leak-proof plumbing.',
      lowStockThreshold: 8,
      isActive: true,
    },
    {
      name: 'Jaquar Heavy Brass Chrome Bib Cock Tap with Wall Flange',
      slug: 'jaquar-brass-bib-cock',
      category: 'plumbing',
      brand: 'Jaquar',
      price: 1450,
      costPrice: 980,
      stockQuantity: 14,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
      description: 'Solid brass tap with mirror chrome finish and ceramic cartridge tested for 500,000 cycles.',
      lowStockThreshold: 5,
      isActive: true,
    },
    // Safety & Workwear
    {
      name: '3M 8210 N95 Industrial Particulate Respirator Masks (Pack of 10)',
      slug: '3m-n95-respirator-mask-10pk',
      category: 'safety',
      brand: '3M',
      price: 890,
      costPrice: 600,
      stockQuantity: 50,
      unit: 'box',
      image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800&q=80',
      description: 'NIOSH approved N95 respiratory protection against paint spray mist, sanding dust, and aerosols.',
      lowStockThreshold: 10,
      isActive: true,
    },
    {
      name: 'Allen Cooper Steel Toe Industrial Safety Boots (Size 9)',
      slug: 'allen-cooper-safety-boots-sz9',
      category: 'safety',
      brand: 'Allen Cooper',
      price: 1999,
      costPrice: 1400,
      stockQuantity: 15,
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      description: 'Genuine leather safety boots with 200 Joules steel toe cap, oil-resistant sole, and anti-skid grip.',
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      name: 'ProCraft Level 5 Cut Resistant Work Gloves (Pair)',
      slug: 'procraft-cut-resistant-gloves',
      category: 'safety',
      brand: 'ProCraft',
      price: 350,
      costPrice: 210,
      stockQuantity: 0, // OUT OF STOCK demo!
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80',
      description: 'HPPE synthetic fiber gloves coated with PU palm for glass handling, metal work, and woodworking.',
      lowStockThreshold: 10,
      isActive: true,
    },
  ]);

  console.log('[Seed] Creating sample historical orders & sales data...');
  const now = new Date();
  const day1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const day2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const day3 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  await Order.insertMany([
    {
      orderNumber: 'ORD-90124',
      user: customer1._id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      shippingAddress: customer1.address,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      items: [
        {
          product: products[0]._id,
          productName: products[0].name,
          price: products[0].price,
          costPrice: products[0].costPrice,
          quantity: 2,
          unit: 'liter',
        },
        {
          product: products[4]._id,
          productName: products[4].name,
          price: products[4].price,
          costPrice: products[4].costPrice,
          quantity: 1,
          unit: 'piece',
        },
      ],
      totalAmount: products[0].price * 2 + products[4].price,
      totalCost: products[0].costPrice * 2 + products[4].costPrice,
      createdAt: day1,
      updatedAt: day1,
    },
    {
      orderNumber: 'ORD-90125',
      user: customer2._id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      shippingAddress: customer2.address,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'DELIVERED',
      items: [
        {
          product: products[11]._id,
          productName: products[11].name,
          price: products[11].price,
          costPrice: products[11].costPrice,
          quantity: 3,
          unit: 'meter',
        },
      ],
      totalAmount: products[11].price * 3,
      totalCost: products[11].costPrice * 3,
      createdAt: day2,
      updatedAt: day2,
    },
    {
      orderNumber: 'ORD-90126',
      user: customer1._id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      shippingAddress: customer1.address,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      items: [
        {
          product: products[5]._id,
          productName: products[5].name,
          price: products[5].price,
          costPrice: products[5].costPrice,
          quantity: 1,
          unit: 'box',
        },
        {
          product: products[8]._id,
          productName: products[8].name,
          price: products[8].price,
          costPrice: products[8].costPrice,
          quantity: 4,
          unit: 'piece',
        },
      ],
      totalAmount: products[5].price + products[8].price * 4,
      totalCost: products[5].costPrice + products[8].costPrice * 4,
      createdAt: day3,
      updatedAt: day3,
    },
    {
      orderNumber: 'ORD-90127',
      user: customer2._id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      shippingAddress: customer2.address,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      items: [
        {
          product: products[1]._id,
          productName: products[1].name,
          price: products[1].price,
          costPrice: products[1].costPrice,
          quantity: 2,
          unit: 'liter',
        },
      ],
      totalAmount: products[1].price * 2,
      totalCost: products[1].costPrice * 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log('[Seed] Creating sample expense records...');
  await Expense.insertMany([
    {
      title: 'Bulk Paint Shipment - Asian Paints & Dulux',
      amount: 45000,
      category: 'STOCK_PURCHASE',
      notes: 'Received 30 buckets of Royale and Velvet Touch emulsion',
      createdAt: day1,
    },
    {
      title: 'Power Tools Delivery - Bosch & DeWalt',
      amount: 62000,
      category: 'STOCK_PURCHASE',
      notes: 'New stock of rotary hammer drills and angle grinders',
      createdAt: day2,
    },
    {
      title: 'Shop Electricity & Warehouse Rent',
      amount: 18500,
      category: 'UTILITIES',
      notes: 'Monthly utility billing for MG Road showroom',
      createdAt: day3,
    },
  ]);

  console.log('[Seed] Creating demo Coupons, Suppliers, Purchase Orders & Notification Settings...');
  await Coupon.create([
    {
      code: 'FLAT500',
      discountType: 'FIXED',
      discountValue: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      minOrderValue: 3000,
      usageLimitTotal: 100,
      usageLimitPerCustomer: 2,
      usedCount: 5,
      applicableCategories: ['all'],
      isActive: true,
    },
    {
      code: 'PAINT10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      minOrderValue: 1000,
      usageLimitTotal: 50,
      usageLimitPerCustomer: 1,
      usedCount: 2,
      applicableCategories: ['paint'],
      isActive: true,
    },
    {
      code: 'WELCOME200',
      discountType: 'FIXED',
      discountValue: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 3600 * 1000),
      minOrderValue: 500,
      usageLimitTotal: 500,
      usageLimitPerCustomer: 1,
      usedCount: 18,
      applicableCategories: ['all'],
      isActive: true,
    },
  ]);

  const [sup1, sup2, sup3] = await Supplier.create([
    {
      name: 'Asian Paints & Coatings Depot',
      phone: '+91 80 2345 6789',
      address: 'Industrial Area, Peenya, Bangalore',
      itemsSupplied: ['paint'],
      outstandingBalance: 12500,
    },
    {
      name: 'Bosch & DeWalt Industrial Tools Ltd',
      phone: '+91 80 8765 4321',
      address: 'Whitefield Commercial Hub, Bangalore',
      itemsSupplied: ['tools', 'hardware'],
      outstandingBalance: 35000,
    },
    {
      name: 'Finolex & Anchor Electrical Wholesalers',
      phone: '+91 80 5544 3322',
      address: 'SP Road Wholesale Market, Bangalore',
      itemsSupplied: ['electrical', 'plumbing'],
      outstandingBalance: 0,
    },
  ]);

  await PurchaseOrder.create([
    {
      poNumber: 'PO-2026-101',
      supplier: sup1._id,
      supplierName: sup1.name,
      items: [
        {
          product: products[0]._id,
          productName: products[0].name,
          quantity: 15,
          unitCost: products[0].costPrice,
        },
      ],
      totalAmount: 15 * products[0].costPrice,
      amountPaid: 15 * products[0].costPrice - 12500,
      status: 'RECEIVED',
      receivedAt: new Date(),
    },
    {
      poNumber: 'PO-2026-102',
      supplier: sup2._id,
      supplierName: sup2.name,
      items: [
        {
          product: products[1]._id,
          productName: products[1].name,
          quantity: 10,
          unitCost: products[1].costPrice,
        },
      ],
      totalAmount: 10 * products[1].costPrice,
      amountPaid: 0,
      status: 'PENDING',
    },
  ]);

  await NotificationSetting.create({
    smsOrderPlaced: true,
    smsOrderStatusChanged: true,
    smsNewOrderAdmin: true,
    smsLowStockAdmin: true,
    whatsappOrderPlaced: true,
    whatsappOrderStatusChanged: true,
    whatsappNewOrderAdmin: true,
    whatsappLowStockAdmin: true,
    provider: 'SIMULATED',
    senderPhone: '+91 98765 43210',
    adminPhone: '+91 98765 43210',
    notificationLog: [
      {
        timestamp: new Date(Date.now() - 3600 * 1000),
        recipient: '+91 98123 45678',
        channel: 'WHATSAPP',
        message: 'ProCraft Order Confirmed! Your Order #ORD-849201 for Rs.14,250 has been placed successfully.',
        status: 'SIMULATED',
        provider: 'SIMULATED',
      },
      {
        timestamp: new Date(Date.now() - 7200 * 1000),
        recipient: '+91 98765 43210',
        channel: 'SMS',
        message: '[ADMIN ALERT] New Order Received! #ORD-849201 placed by John Verma for Rs.14,250.',
        status: 'SIMULATED',
        provider: 'SIMULATED',
      },
      {
        timestamp: new Date(Date.now() - 10800 * 1000),
        recipient: '+91 91234 56789',
        channel: 'WHATSAPP',
        message: 'ProCraft Order Status Update: Order #ORD-771239 status is now DELIVERED.',
        status: 'SIMULATED',
        provider: 'SIMULATED',
      },
    ],
  });

  console.log('[Seed] Database seeding completed successfully! ✨');
};

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedData();
    await disconnectDB();
  })().catch((err) => {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  });
}
