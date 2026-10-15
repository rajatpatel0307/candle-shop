-- Extend the supplied storefront schema without replacing tables or existing data.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.CheckoutSessions', 'ShippingAddressId') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD ShippingAddressId uniqueidentifier NULL REFERENCES dbo.UserAddresses(AddressId);
IF COL_LENGTH('dbo.CheckoutSessions', 'BillingAddressId') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD BillingAddressId uniqueidentifier NULL REFERENCES dbo.UserAddresses(AddressId);
IF COL_LENGTH('dbo.CheckoutSessions', 'ShippingMethodId') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD ShippingMethodId int NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'IdempotencyKey') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD IdempotencyKey uniqueidentifier NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'RequestHash') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD RequestHash char(64) NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'OrderId') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD OrderId uniqueidentifier NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'CouponCode') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD CouponCode nvarchar(50) NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'UpdatedAtUtc') IS NULL
  ALTER TABLE dbo.CheckoutSessions ADD UpdatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME();

-- Read aliases keep existing dashboard and customer components compatible.
IF COL_LENGTH('dbo.Orders', 'SubtotalAmount') IS NULL
  EXEC('ALTER TABLE dbo.Orders ADD SubtotalAmount AS Subtotal');
IF COL_LENGTH('dbo.Orders', 'DiscountAmount') IS NULL
  EXEC('ALTER TABLE dbo.Orders ADD DiscountAmount AS DiscountTotal');
IF COL_LENGTH('dbo.Orders', 'TaxAmount') IS NULL
  EXEC('ALTER TABLE dbo.Orders ADD TaxAmount AS TaxTotal');
IF COL_LENGTH('dbo.Orders', 'ShippingAmount') IS NULL
  EXEC('ALTER TABLE dbo.Orders ADD ShippingAmount AS ShippingTotal');
IF COL_LENGTH('dbo.Orders', 'IdempotencyKey') IS NULL
  ALTER TABLE dbo.Orders ADD IdempotencyKey uniqueidentifier NULL;
IF COL_LENGTH('dbo.Orders', 'PaymentMethod') IS NULL
  ALTER TABLE dbo.Orders ADD PaymentMethod nvarchar(30) NULL;
IF COL_LENGTH('dbo.OrderItems', 'SKU') IS NULL
  EXEC('ALTER TABLE dbo.OrderItems ADD SKU AS SKUSnapshot');
IF COL_LENGTH('dbo.OrderStatusHistory', 'OldStatus') IS NULL
  EXEC('ALTER TABLE dbo.OrderStatusHistory ADD OldStatus AS PreviousStatus');
IF COL_LENGTH('dbo.OrderStatusHistory', 'Notes') IS NULL
  EXEC('ALTER TABLE dbo.OrderStatusHistory ADD Notes AS ChangeReason');
IF COL_LENGTH('dbo.OrderStatusHistory', 'ChangedAtUtc') IS NULL
  EXEC('ALTER TABLE dbo.OrderStatusHistory ADD ChangedAtUtc AS CreatedAtUtc');
IF COL_LENGTH('dbo.Refunds', 'CreatedAtUtc') IS NULL
  EXEC('ALTER TABLE dbo.Refunds ADD CreatedAtUtc AS RequestedAtUtc');
IF COL_LENGTH('dbo.ShipmentTrackingEvents', 'OccurredAtUtc') IS NULL
  EXEC('ALTER TABLE dbo.ShipmentTrackingEvents ADD OccurredAtUtc AS EventAtUtc');
IF COL_LENGTH('dbo.Payments', 'PaymentProvider') IS NULL
  EXEC('ALTER TABLE dbo.Payments ADD PaymentProvider AS ProviderCode');
IF COL_LENGTH('dbo.Payments', 'FailureReason') IS NULL
  EXEC('ALTER TABLE dbo.Payments ADD FailureReason AS FailureMessage');
IF COL_LENGTH('dbo.PaymentWebhookEvents', 'PayloadJson') IS NULL
  ALTER TABLE dbo.PaymentWebhookEvents ADD PayloadJson nvarchar(max) NULL;
IF COL_LENGTH('dbo.PaymentWebhookEvents', 'AttemptCount') IS NULL
  ALTER TABLE dbo.PaymentWebhookEvents ADD AttemptCount int NOT NULL DEFAULT 0;

IF COL_LENGTH('dbo.InventoryReservations', 'CartId') IS NULL
  ALTER TABLE dbo.InventoryReservations ADD CartId uniqueidentifier NULL;
IF COL_LENGTH('dbo.InventoryReservations', 'CreatedByUserId') IS NULL
  ALTER TABLE dbo.InventoryReservations ADD CreatedByUserId uniqueidentifier NULL;
IF COL_LENGTH('dbo.InventoryReservations', 'IdempotencyKey') IS NULL
  ALTER TABLE dbo.InventoryReservations ADD IdempotencyKey uniqueidentifier NULL;
IF COL_LENGTH('dbo.InventoryReservations', 'ConfirmedAtUtc') IS NULL
  ALTER TABLE dbo.InventoryReservations ADD ConfirmedAtUtc datetime2 NULL;
IF COL_LENGTH('dbo.InventoryReservations', 'UpdatedAtUtc') IS NULL
  ALTER TABLE dbo.InventoryReservations ADD UpdatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME();
IF COL_LENGTH('dbo.InventoryMovements', 'PreviousOnHandQuantity') IS NULL
  ALTER TABLE dbo.InventoryMovements ADD PreviousOnHandQuantity int NULL;
IF COL_LENGTH('dbo.InventoryMovements', 'NewOnHandQuantity') IS NULL
  ALTER TABLE dbo.InventoryMovements ADD NewOnHandQuantity int NULL;
IF COL_LENGTH('dbo.InventoryMovements', 'IdempotencyKey') IS NULL
  ALTER TABLE dbo.InventoryMovements ADD IdempotencyKey uniqueidentifier NULL;

-- Accept the application's statuses alongside the baseline's existing values.
IF OBJECT_ID('dbo.CK_CheckoutSessions_Status', 'C') IS NOT NULL
  ALTER TABLE dbo.CheckoutSessions DROP CONSTRAINT CK_CheckoutSessions_Status;
ALTER TABLE dbo.CheckoutSessions WITH CHECK ADD CONSTRAINT CK_CheckoutSessions_Status
  CHECK (SessionStatus IN ('Open','Completed','Cancelled','Expired','ACTIVE','SUBMITTED','CANCELLED','EXPIRED'));
IF OBJECT_ID('dbo.CK_Orders_Status', 'C') IS NOT NULL
  ALTER TABLE dbo.Orders DROP CONSTRAINT CK_Orders_Status;
ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Status
  CHECK (OrderStatus IN ('PendingPayment','Confirmed','Processing','Shipped','Delivered','Cancelled','Refunded','PartiallyRefunded',
    'PENDING_PAYMENT','CONFIRMED','PROCESSING','PACKED','READY_TO_SHIP','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','CANCELLATION_REQUESTED','RETURN_REQUESTED','RETURNED','REFUNDED'));
IF OBJECT_ID('dbo.CK_Orders_PaymentStatus', 'C') IS NOT NULL
  ALTER TABLE dbo.Orders DROP CONSTRAINT CK_Orders_PaymentStatus;
ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_PaymentStatus
  CHECK (PaymentStatus IN ('Pending','Authorized','Paid','Failed','PartiallyRefunded','Refunded','PENDING','PROCESSING','SUCCEEDED','FAILED','CANCELLED','EXPIRED','REFUNDED'));
IF OBJECT_ID('dbo.CK_Payments_Status', 'C') IS NOT NULL
  ALTER TABLE dbo.Payments DROP CONSTRAINT CK_Payments_Status;
ALTER TABLE dbo.Payments WITH CHECK ADD CONSTRAINT CK_Payments_Status
  CHECK (PaymentStatus IN ('Pending','Authorized','Captured','Failed','Cancelled','PartiallyRefunded','Refunded','PENDING','PROCESSING','SUCCEEDED','FAILED','CANCELLED','EXPIRED','REFUNDED'));
IF OBJECT_ID('dbo.CK_InventoryReservations_Status', 'C') IS NOT NULL
  ALTER TABLE dbo.InventoryReservations DROP CONSTRAINT CK_InventoryReservations_Status;
ALTER TABLE dbo.InventoryReservations WITH CHECK ADD CONSTRAINT CK_InventoryReservations_Status
  CHECK (ReservationStatus IN ('Active','Consumed','Released','Expired','ACTIVE','CONFIRMED','RELEASED','EXPIRED'));
IF OBJECT_ID('dbo.CK_InventoryMovements_Type', 'C') IS NOT NULL
  ALTER TABLE dbo.InventoryMovements DROP CONSTRAINT CK_InventoryMovements_Type;
ALTER TABLE dbo.InventoryMovements WITH CHECK ADD CONSTRAINT CK_InventoryMovements_Type
  CHECK (MovementType IN ('Receipt','Sale','Return','Adjustment','Reservation','Release','Damage',
    'RECEIPT','ADJUSTMENT_IN','ADJUSTMENT_OUT','ORDER_DEDUCTION','RETURN','DAMAGE','LOSS'));

COMMIT;
