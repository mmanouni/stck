const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: String, required: true }], // List of permissions associated with the role
  createdAt: { type: Date, default: Date.now },
});

roleSchema.pre('save', function (next) {
  if (!Array.isArray(this.permissions) || this.permissions.length === 0) {
    return next(new Error('Permissions must be a non-empty array.'));
  }
  next();
});

const predefinedRoles = [
  {
    name: 'superadmin',
    description: 'Has full access to all features and settings.',
    permissions: [
      'manage_roles',
      'manage_users',
      'view_reports',
      'manage_inventory',
      'manage_transactions',
      'manage_categories',
      'view_audit_logs',
      'manage_licenses',
      'view_analytics', // New permission
    ],
  },
  {
    name: 'admin',
    description: 'Can manage users, view reports, and oversee operations.',
    permissions: [
      'manage_users',
      'view_reports',
      'manage_inventory',
      'manage_transactions',
      'manage_categories',
      'view_audit_logs',
    ],
  },
  {
    name: 'manager',
    description: 'Can manage inventory and oversee sellers and inventory clerks.',
    permissions: [
      'manage_inventory',
      'view_reports',
      'assign_roles',
      'manage_categories',
    ],
  },
  {
    name: 'seller',
    description: 'Can sell products and view sales reports.',
    permissions: [
      'sell_products',
      'view_sales_reports',
      'manage_own_transactions',
    ],
  },
  {
    name: 'inventory_clerk',
    description: 'Can add and update product information in the inventory.',
    permissions: [
      'add_products',
      'update_products',
      'view_inventory',
    ],
  },
];

roleSchema.statics.initializeRoles = async function () {
  for (const role of predefinedRoles) {
    const existingRole = await this.findOne({ name: role.name });
    if (!existingRole) {
      await this.create(role);
    }
  }
};

module.exports = mongoose.model('Role', roleSchema);
