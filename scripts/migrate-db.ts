import { poolConnection } from "../src/db";

async function runMigration() {
  console.log("==========================================");
  console.log(" AIVEN MYSQL DATABASE SCHEMA MIGRATION");
  console.log("==========================================");

  if (!poolConnection) {
    console.error("ERROR: DATABASE_URL environment variable is not defined.");
    process.exit(1);
  }

  const tableQueries = [
    // 1. Users
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      role ENUM('admin', 'supervisor', 'salesman') NOT NULL DEFAULT 'salesman',
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 2. Products
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      sku VARCHAR(50) NOT NULL DEFAULT '',
      category VARCHAR(50) NOT NULL,
      pack_size VARCHAR(50) NOT NULL,
      unit VARCHAR(20) NOT NULL DEFAULT 'pkt',
      mrp DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      current_purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      gst_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
      min_stock INT NOT NULL DEFAULT 10,
      supplier_id VARCHAR(50),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 2a. Suppliers
    `CREATE TABLE IF NOT EXISTS suppliers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) NOT NULL DEFAULT '',
      phone VARCHAR(20) NOT NULL,
      alt_phone VARCHAR(20),
      address VARCHAR(250),
      gstin VARCHAR(30),
      payment_terms VARCHAR(100) DEFAULT 'Immediate',
      opening_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      current_payable DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 2b. Supplier Product Prices
    `CREATE TABLE IF NOT EXISTS supplier_product_prices (
      id VARCHAR(50) PRIMARY KEY,
      supplier_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      purchase_price DECIMAL(10, 2) NOT NULL,
      previous_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      diff_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      percentage_change DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
      invoice_id VARCHAR(50),
      changed_by VARCHAR(50),
      effective_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 3. Customers
    `CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      owner VARCHAR(100),
      phone VARCHAR(20) NOT NULL,
      address VARCHAR(250),
      type VARCHAR(50) NOT NULL DEFAULT 'Retail Shop',
      active BOOLEAN NOT NULL DEFAULT true,
      salesman_id VARCHAR(50) NOT NULL,
      opening_outstanding DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 4. Customer Product Prices
    `CREATE TABLE IF NOT EXISTS customer_product_prices (
      id VARCHAR(50) PRIMARY KEY,
      customer_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by VARCHAR(50)
    ) ENGINE=InnoDB;`,

    // 5. Purchase Invoices
    `CREATE TABLE IF NOT EXISTS purchase_invoices (
      id VARCHAR(50) PRIMARY KEY,
      date DATE NOT NULL,
      supplier_id VARCHAR(50),
      supplier VARCHAR(100) NOT NULL,
      bill_no VARCHAR(50) NOT NULL,
      total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      pending_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      payment_status ENUM('paid', 'partial', 'pending') NOT NULL DEFAULT 'pending',
      payment_mode ENUM('cash', 'upi', 'bank', 'other') DEFAULT 'cash',
      bill_photo VARCHAR(250),
      verified_by VARCHAR(50),
      verified_at TIMESTAMP NULL,
      client_transaction_id VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 6. Purchase Invoice Items
    `CREATE TABLE IF NOT EXISTS purchase_invoice_items (
      id VARCHAR(50) PRIMARY KEY,
      purchase_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      bill_qty INT NOT NULL DEFAULT 0,
      verified_qty INT NOT NULL DEFAULT 0,
      rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      mrp DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      gst_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00
    ) ENGINE=InnoDB;`,

    // 7. Allocations
    `CREATE TABLE IF NOT EXISTS allocations (
      id VARCHAR(50) PRIMARY KEY,
      date DATE NOT NULL,
      salesman_id VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 8. Allocation Items
    `CREATE TABLE IF NOT EXISTS allocation_items (
      id VARCHAR(50) PRIMARY KEY,
      allocation_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      qty INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB;`,

    // 9. Stock Movements
    `CREATE TABLE IF NOT EXISTS stock_movements (
      id VARCHAR(50) PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      quantity INT NOT NULL,
      movement_type ENUM('OPENING', 'PURCHASE', 'SALESMAN_ALLOCATION', 'SALE', 'CUSTOMER_RETURN', 'SALESMAN_RETURN', 'ADJUSTMENT', 'CLOSING') NOT NULL,
      source_type VARCHAR(50),
      source_id VARCHAR(50),
      from_location VARCHAR(50),
      to_location VARCHAR(50),
      user_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 10. Salesman Stock
    `CREATE TABLE IF NOT EXISTS salesman_stock (
      id VARCHAR(50) PRIMARY KEY,
      salesman_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      quantity INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 11. Attendance
    `CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      check_in VARCHAR(10) NOT NULL,
      status ENUM('present', 'closed') NOT NULL DEFAULT 'present',
      closed_at VARCHAR(10),
      working_duration VARCHAR(20)
    ) ENGINE=InnoDB;`,

    // 12. Routes
    `CREATE TABLE IF NOT EXISTS routes (
      id VARCHAR(50) PRIMARY KEY,
      salesman_id VARCHAR(50) NOT NULL,
      route_name VARCHAR(100) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true
    ) ENGINE=InnoDB;`,

    // 13. Route Customers
    `CREATE TABLE IF NOT EXISTS route_customers (
      id VARCHAR(50) PRIMARY KEY,
      route_id VARCHAR(50) NOT NULL,
      customer_id VARCHAR(50) NOT NULL,
      sequence INT NOT NULL DEFAULT 0,
      visit_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    ) ENGINE=InnoDB;`,

    // 14. Sales
    `CREATE TABLE IF NOT EXISTS sales (
      id VARCHAR(50) PRIMARY KEY,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      customer_id VARCHAR(50) NOT NULL,
      salesman_id VARCHAR(50) NOT NULL,
      total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      received DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      status ENUM('paid', 'partial', 'pending') NOT NULL DEFAULT 'pending',
      mode ENUM('cash', 'upi', 'other') NOT NULL DEFAULT 'cash',
      client_transaction_id VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 15. Sale Items
    `CREATE TABLE IF NOT EXISTS sale_items (
      id VARCHAR(50) PRIMARY KEY,
      sale_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      qty INT NOT NULL DEFAULT 0,
      rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00
    ) ENGINE=InnoDB;`,

    // 16. Returns
    `CREATE TABLE IF NOT EXISTS returns (
      id VARCHAR(50) PRIMARY KEY,
      date DATE NOT NULL,
      salesman_id VARCHAR(50) NOT NULL,
      customer_id VARCHAR(50),
      product_id VARCHAR(50) NOT NULL,
      qty INT NOT NULL DEFAULT 0,
      reason VARCHAR(250) NOT NULL,
      client_transaction_id VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 17. Payment Denominations
    `CREATE TABLE IF NOT EXISTS payment_denominations (
      id VARCHAR(50) PRIMARY KEY,
      sale_id VARCHAR(50) NOT NULL,
      denom_value INT NOT NULL,
      denom_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 18. Daily Closings
    `CREATE TABLE IF NOT EXISTS daily_closings (
      id VARCHAR(50) PRIMARY KEY,
      salesman_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      expected_stock JSON NOT NULL,
      actual_stock JSON NOT NULL,
      difference JSON NOT NULL,
      closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      closed_by VARCHAR(50)
    ) ENGINE=InnoDB;`,

    // 19. Cash Transactions
    `CREATE TABLE IF NOT EXISTS cash_transactions (
      id VARCHAR(50) PRIMARY KEY,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      type ENUM('CUSTOMER_COLLECTION', 'SUPPLIER_PAYMENT', 'EXPENSE', 'OTHER_INFLOW', 'OPENING_BALANCE') NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      mode ENUM('cash', 'upi', 'bank', 'other') NOT NULL DEFAULT 'cash',
      reference_id VARCHAR(50),
      party_name VARCHAR(100),
      description VARCHAR(250),
      user_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 20. Customer Purchase Trends
    `CREATE TABLE IF NOT EXISTS customer_purchase_trends (
      id VARCHAR(50) PRIMARY KEY,
      customer_id VARCHAR(50) NOT NULL,
      normal_average DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      recent_average DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      decrease_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 21. Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      message VARCHAR(250) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'info',
      read_status BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    // 22. Audit Logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      entity VARCHAR(50) NOT NULL,
      entity_id VARCHAR(50) NOT NULL,
      old_data JSON,
      new_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`
  ];

  try {
    for (const q of tableQueries) {
      await poolConnection.query(q);
    }
    console.log("✔ All 22 Aiven MySQL tables verified and synchronized successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await poolConnection.end();
  }
}

runMigration();
