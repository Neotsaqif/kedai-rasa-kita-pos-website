-- ============================================================
-- Kedai Rasa Kita POS — MySQL Schema (local XAMPP / phpMyAdmin)
-- Run this in phpMyAdmin (import) or via the mysql CLI against a
-- database named `kedai_rasa_kita`.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `kedai_rasa_kita`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kedai_rasa_kita`;

-- 1. USERS (staff accounts; replaces Supabase auth.users + public.profiles)
--    `id` is a UUID string so component assumptions about user.id stay consistent.
CREATE TABLE IF NOT EXISTS `users` (
  `id`            VARCHAR(36)  NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name`          VARCHAR(255) NOT NULL,
  `role`          ENUM('admin','cashier') NOT NULL DEFAULT 'cashier',
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `sku`         VARCHAR(100)    NULL,
  `name`        VARCHAR(255)    NOT NULL,
  `category_id` INT UNSIGNED    NULL,
  `price`       DECIMAL(12,2)   NOT NULL DEFAULT 0,
  `stock_qty`   INT             NOT NULL DEFAULT 0,
  `image_url`   VARCHAR(500)    NULL,
  `is_active`   TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_sku` (`sku`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. SALES (transaction header)
CREATE TABLE IF NOT EXISTS `sales` (
  `id`             INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `receipt_number` VARCHAR(50)    NOT NULL,
  `cashier_id`     VARCHAR(36)    NULL,
  `total_amount`   DECIMAL(12,2)  NOT NULL DEFAULT 0,
  `payment_method` ENUM('cash','qris','debit','transfer') NOT NULL DEFAULT 'cash',
  `status`         VARCHAR(30)    NOT NULL DEFAULT 'completed',
  `notes`          TEXT           NULL,
  `created_at`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sales_receipt` (`receipt_number`),
  KEY `idx_sales_cashier` (`cashier_id`),
  CONSTRAINT `fk_sales_cashier` FOREIGN KEY (`cashier_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SALE ITEMS (transaction line items)
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `sale_id`       INT UNSIGNED  NOT NULL,
  `product_id`    INT UNSIGNED  NULL,
  `product_name`  VARCHAR(255)  NOT NULL,
  `qty`           INT           NOT NULL,
  `price_at_sale` DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_sale_items_sale` (`sale_id`),
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`)
    REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. STOCK LOGS (audit trail)
CREATE TABLE IF NOT EXISTS `stock_logs` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`     INT UNSIGNED NULL,
  `product_name`   VARCHAR(255) NULL,
  `change_qty`     INT          NOT NULL DEFAULT 0,
  `reason`         VARCHAR(20)  NOT NULL DEFAULT 'adjustment',
  `user_name`      VARCHAR(255) NULL,
  `note`           TEXT         NULL,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stock_logs_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. SESSIONS (server-side auth tokens)
--   On login a random 64-char token is stored here and returned to the client.
--   Protected API actions require `Authorization: Bearer <token>`. Tokens are
--   validated against this table so a client cannot forge an admin session.
CREATE TABLE IF NOT EXISTS `sessions` (
  `token`      CHAR(64)    NOT NULL,
  `user_id`    VARCHAR(36) NOT NULL,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME    NOT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_sessions_user` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- status values accepted (completed, cancelled, refund_requested, refunded)
-- are stored as VARCHAR; the API validates them. This mirrors the current
-- Supabase plan where `status` had its own enumerated set.