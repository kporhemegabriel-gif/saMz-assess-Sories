// In-memory database - no file system access needed
let data = {
  products: [
    { id: '1', name: 'Luxury Amethyst Crystal Wristlet', category: 'luxury-bracelets', price: 180, imageData: null, createdAt: Date.now() },
    { id: '2', name: 'Premium Royal Waist Bead Trio', category: 'premium-beads', price: 250, imageData: null, createdAt: Date.now() },
    { id: '3', name: 'Rose Quartz Gold Accented Bracelet', category: 'luxury-bracelets', price: 195, imageData: null, createdAt: Date.now() },
    { id: '4', name: 'Turquoise Heritage Statement Cuff', category: 'luxury-bracelets', price: 210, imageData: null, createdAt: Date.now() }
  ],
  customers: [],
  orders: []
};

export function getProducts() {
  return data.products;
}

export function addProduct(product) {
  data.products.unshift(product);
  return product;
}

export function deleteProduct(id) {
  data.products = data.products.filter(p => p.id !== id);
}

export function getCustomers() {
  return data.customers;
}

export function addCustomer(customer) {
  data.customers.push(customer);
  return customer;
}

export function getCustomer(email) {
  return data.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
}

export function customerExists(email) {
  return !!getCustomer(email);
}

export function getOrders() {
  return data.orders;
}

export function addOrder(order) {
  data.orders.push(order);
  return order;
}

export function getOrder(id) {
  return data.orders.find(o => o.id === id);
}

export function updateOrderStatus(id, status) {
  const order = getOrder(id);
  if (order) {
    order.status = status;
    order.updatedAt = Date.now();
  }
}

export function getCustomerOrders(email) {
  return data.orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
}
