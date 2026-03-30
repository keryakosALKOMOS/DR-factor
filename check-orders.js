const mongoose = require('mongoose');

async function checkDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/dsfactor');
    console.log('Connected to DB');
    
    const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const CustomDesignOrder = mongoose.models.CustomDesignOrder || mongoose.model('CustomDesignOrder', new mongoose.Schema({}, { strict: false }));
    
    const orders = await Order.find();
    const customOrders = await CustomDesignOrder.find();
    
    console.log('Standard Orders Count:', orders.length);
    console.log('Custom Orders Count:', customOrders.length);
    
    if (orders.length > 0) {
      console.log('Latest Standard Order:', orders[orders.length - 1]);
    }
    if (customOrders.length > 0) {
      console.log('Latest Custom Order:', customOrders[customOrders.length - 1]);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDB();
