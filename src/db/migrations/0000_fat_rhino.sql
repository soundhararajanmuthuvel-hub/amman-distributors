CREATE TABLE `allocation_items` (
	`id` varchar(50) NOT NULL,
	`allocation_id` varchar(50) NOT NULL,
	`product_id` varchar(50) NOT NULL,
	`qty` int NOT NULL DEFAULT 0,
	CONSTRAINT `allocation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `allocations` (
	`id` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`salesman_id` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`check_in` varchar(10) NOT NULL,
	`status` enum('present','closed') NOT NULL DEFAULT 'present',
	`closed_at` varchar(10),
	`working_duration` varchar(20),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(50) NOT NULL,
	`user_id` varchar(50),
	`action` varchar(100) NOT NULL,
	`entity` varchar(50) NOT NULL,
	`entity_id` varchar(50) NOT NULL,
	`old_data` json,
	`new_data` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_product_prices` (
	`id` varchar(50) NOT NULL,
	`customer_id` varchar(50) NOT NULL,
	`product_id` varchar(50) NOT NULL,
	`selling_price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` varchar(50),
	CONSTRAINT `customer_product_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_purchase_trends` (
	`id` varchar(50) NOT NULL,
	`customer_id` varchar(50) NOT NULL,
	`normal_average` decimal(10,2) NOT NULL DEFAULT '0.00',
	`recent_average` decimal(10,2) NOT NULL DEFAULT '0.00',
	`decrease_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_purchase_trends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`owner` varchar(100),
	`phone` varchar(20) NOT NULL,
	`address` varchar(250),
	`type` varchar(50) NOT NULL DEFAULT 'Retail Shop',
	`active` boolean NOT NULL DEFAULT true,
	`salesman_id` varchar(50) NOT NULL,
	`opening_outstanding` decimal(10,2) NOT NULL DEFAULT '0.00',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_closings` (
	`id` varchar(50) NOT NULL,
	`salesman_id` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`expected_stock` json NOT NULL,
	`actual_stock` json NOT NULL,
	`difference` json NOT NULL,
	`closed_at` timestamp DEFAULT (now()),
	`closed_by` varchar(50),
	CONSTRAINT `daily_closings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(50) NOT NULL,
	`title` varchar(150) NOT NULL,
	`message` varchar(250) NOT NULL,
	`type` varchar(50) NOT NULL DEFAULT 'info',
	`read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_denominations` (
	`id` varchar(50) NOT NULL,
	`sale_id` varchar(50) NOT NULL,
	`denom_value` int NOT NULL,
	`denom_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payment_denominations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`pack_size` varchar(50) NOT NULL,
	`unit` varchar(20) NOT NULL DEFAULT 'pkt',
	`mrp` decimal(10,2) NOT NULL DEFAULT '0.00',
	`rate` decimal(10,2) NOT NULL DEFAULT '0.00',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_invoice_items` (
	`id` varchar(50) NOT NULL,
	`purchase_id` varchar(50) NOT NULL,
	`product_id` varchar(50) NOT NULL,
	`bill_qty` int NOT NULL DEFAULT 0,
	`verified_qty` int NOT NULL DEFAULT 0,
	`rate` decimal(10,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `purchase_invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_invoices` (
	`id` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`supplier` varchar(100) NOT NULL,
	`bill_no` varchar(50) NOT NULL,
	`total` decimal(10,2) NOT NULL DEFAULT '0.00',
	`bill_photo` varchar(250),
	`verified_by` varchar(50),
	`verified_at` timestamp,
	`client_transaction_id` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `purchase_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_invoices_client_transaction_id_unique` UNIQUE(`client_transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`salesman_id` varchar(50) NOT NULL,
	`customer_id` varchar(50),
	`product_id` varchar(50) NOT NULL,
	`qty` int NOT NULL DEFAULT 0,
	`reason` varchar(250) NOT NULL,
	`client_transaction_id` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `returns_id` PRIMARY KEY(`id`),
	CONSTRAINT `returns_client_transaction_id_unique` UNIQUE(`client_transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `route_customers` (
	`id` varchar(50) NOT NULL,
	`route_id` varchar(50) NOT NULL,
	`customer_id` varchar(50) NOT NULL,
	`sequence` int NOT NULL DEFAULT 0,
	`visit_status` varchar(20) NOT NULL DEFAULT 'pending',
	CONSTRAINT `route_customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` varchar(50) NOT NULL,
	`salesman_id` varchar(50) NOT NULL,
	`route_name` varchar(100) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` varchar(50) NOT NULL,
	`sale_id` varchar(50) NOT NULL,
	`product_id` varchar(50) NOT NULL,
	`qty` int NOT NULL DEFAULT 0,
	`rate` decimal(10,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `sale_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`time` varchar(10) NOT NULL,
	`customer_id` varchar(50) NOT NULL,
	`salesman_id` varchar(50) NOT NULL,
	`total` decimal(10,2) NOT NULL DEFAULT '0.00',
	`received` decimal(10,2) NOT NULL DEFAULT '0.00',
	`status` enum('paid','partial','pending') NOT NULL DEFAULT 'pending',
	`mode` enum('cash','upi','other') NOT NULL DEFAULT 'cash',
	`client_transaction_id` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_client_transaction_id_unique` UNIQUE(`client_transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `salesman_stock` (
	`id` varchar(50) NOT NULL,
	`salesman_id` varchar(50) NOT NULL,
	`product_id` varchar(50) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesman_stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` varchar(50) NOT NULL,
	`product_id` varchar(50) NOT NULL,
	`quantity` int NOT NULL,
	`movement_type` enum('OPENING','PURCHASE','SALESMAN_ALLOCATION','SALE','CUSTOMER_RETURN','SALESMAN_RETURN','ADJUSTMENT','CLOSING') NOT NULL,
	`source_type` varchar(50),
	`source_id` varchar(50),
	`from_location` varchar(50),
	`to_location` varchar(50),
	`user_id` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(100),
	`role` enum('admin','supervisor','salesman') NOT NULL DEFAULT 'salesman',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
