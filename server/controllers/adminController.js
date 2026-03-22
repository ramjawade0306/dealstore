const ExcelJS = require('exceljs');
const Order = require('../models/Order');

// @desc    Export orders to Excel
// @route   GET /api/admin/export
// @access  Private/Admin
exports.exportOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};
    if (status) query.orderStatus = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const orders = await Order.find(query)
      .populate('user', 'phoneNumber name')
      .populate('items.product', 'title brand')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Phone Number', key: 'phone', width: 18 },
      { header: 'Delivery Address', key: 'address', width: 35 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Product Price', key: 'productPrice', width: 15 },
      { header: 'Total Order Price', key: 'totalPrice', width: 18 },
      { header: 'Payment Method', key: 'paymentMethod', width: 18 },
      { header: 'Payment Status', key: 'paymentStatus', width: 16 },
      { header: 'Order Status', key: 'orderStatus', width: 18 },
      { header: 'Courier Company', key: 'courier', width: 18 },
      { header: 'Tracking Number', key: 'trackingNumber', width: 20 },
      { header: 'Order Date', key: 'orderDate', width: 22 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD700' }
    };

    orders.forEach(order => {
      const address = order.shippingAddress
        ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`
        : '';
      order.items.forEach(item => {
        worksheet.addRow({
          orderId: order._id.toString(),
          customerName: order.user?.name || 'N/A',
          phone: order.user?.phoneNumber || 'N/A',
          address,
          productName: item.product?.title || 'Deleted Product',
          quantity: item.quantity,
          productPrice: item.price,
          totalPrice: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          courier: order.courier?.company || '',
          trackingNumber: order.courier?.trackingNumber || '',
          orderDate: order.createdAt.toISOString().slice(0, 19).replace('T', ' '),
        });
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="orders_export_${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
