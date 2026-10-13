import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { SHIPMENT_STATUS } from './shipping.constants.js';

export async function getOrder(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query('SELECT TOP 1 * FROM dbo.Orders WHERE OrderId = @orderId;');
  return result.recordset[0] ?? null;
}

export async function createShipment({ orderId, input }) {
  const pool = await getPool();
  const shipmentNumber = `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('orderId', sql.UniqueIdentifier, orderId)
    .input('number', sql.NVarChar(100), shipmentNumber)
    .input('carrierName', sql.NVarChar(100), input.carrierName)
    .input('carrierCode', sql.NVarChar(100), input.carrierCode ?? null)
    .input('service', sql.NVarChar(100), input.shippingService ?? null)
    .input('trackingNumber', sql.NVarChar(200), input.trackingNumber ?? null)
    .input('trackingUrl', sql.NVarChar(1000), input.trackingUrl ?? null)
    .input('status', sql.VarChar(30), SHIPMENT_STATUS.CREATED)
    .input('cost', sql.Decimal(18, 2), input.shippingCost ?? 0)
    .input('eta', sql.DateTime2, input.estimatedDeliveryAtUtc ?? null)
    .query(`
      INSERT INTO dbo.Shipments (
        ShipmentId, OrderId, ShipmentNumber, CarrierName, CarrierCode, ShippingService,
        TrackingNumber, TrackingUrl, ShipmentStatus, ShippingCost, EstimatedDeliveryAtUtc
      )
      OUTPUT inserted.*
      VALUES (@id, @orderId, @number, @carrierName, @carrierCode, @service, @trackingNumber, @trackingUrl, @status, @cost, @eta);
    `);
  return result.recordset[0];
}

export async function listShipmentsByOrder(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query('SELECT * FROM dbo.Shipments WHERE OrderId = @orderId ORDER BY CreatedAtUtc DESC;');
  return result.recordset;
}

export async function getShipment(shipmentId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('shipmentId', sql.UniqueIdentifier, shipmentId)
    .query('SELECT TOP 1 * FROM dbo.Shipments WHERE ShipmentId = @shipmentId;');
  return result.recordset[0] ?? null;
}

export async function updateShipment(shipmentId, input) {
  const current = await getShipment(shipmentId);
  if (!current) return null;
  const pool = await getPool();
  const result = await pool.request()
    .input('shipmentId', sql.UniqueIdentifier, shipmentId)
    .input('carrierName', sql.NVarChar(100), input.carrierName ?? current.CarrierName)
    .input('carrierCode', sql.NVarChar(100), input.carrierCode ?? current.CarrierCode)
    .input('service', sql.NVarChar(100), input.shippingService ?? current.ShippingService)
    .input('trackingNumber', sql.NVarChar(200), input.trackingNumber ?? current.TrackingNumber)
    .input('trackingUrl', sql.NVarChar(1000), input.trackingUrl ?? current.TrackingUrl)
    .input('status', sql.VarChar(30), input.shipmentStatus ?? current.ShipmentStatus)
    .input('cost', sql.Decimal(18, 2), input.shippingCost ?? current.ShippingCost)
    .input('eta', sql.DateTime2, input.estimatedDeliveryAtUtc ?? current.EstimatedDeliveryAtUtc)
    .query(`
      UPDATE dbo.Shipments
      SET CarrierName = @carrierName,
          CarrierCode = @carrierCode,
          ShippingService = @service,
          TrackingNumber = @trackingNumber,
          TrackingUrl = @trackingUrl,
          ShipmentStatus = @status,
          ShippingCost = @cost,
          EstimatedDeliveryAtUtc = @eta,
          DeliveredAtUtc = CASE WHEN @status = 'DELIVERED' THEN COALESCE(DeliveredAtUtc, SYSUTCDATETIME()) ELSE DeliveredAtUtc END,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE ShipmentId = @shipmentId;
    `);
  return result.recordset[0] ?? null;
}

export async function addTrackingEvent({ shipmentId, input, userId }) {
  const pool = await getPool();
  try {
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, randomUUID())
      .input('shipmentId', sql.UniqueIdentifier, shipmentId)
      .input('providerEventId', sql.NVarChar(200), input.providerEventId ?? null)
      .input('status', sql.VarChar(30), input.trackingStatus)
      .input('description', sql.NVarChar(500), input.eventDescription ?? null)
      .input('location', sql.NVarChar(200), input.eventLocation ?? null)
      .input('occurredAt', sql.DateTime2, input.occurredAtUtc)
      .input('userId', sql.UniqueIdentifier, userId ?? null)
      .query(`
        INSERT INTO dbo.ShipmentTrackingEvents (
          ShipmentTrackingEventId, ShipmentId, ProviderEventId, TrackingStatus,
          EventDescription, EventLocation, OccurredAtUtc, CreatedByUserId
        )
        OUTPUT inserted.*
        VALUES (@id, @shipmentId, @providerEventId, @status, @description, @location, @occurredAt, @userId);
      `);
    await updateShipment(shipmentId, { shipmentStatus: input.trackingStatus });
    return { event: result.recordset[0], duplicate: false };
  } catch (error) {
    if (error?.number === 2601 || error?.number === 2627) return { event: null, duplicate: true };
    throw error;
  }
}

export async function listTrackingEvents(shipmentId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('shipmentId', sql.UniqueIdentifier, shipmentId)
    .query('SELECT * FROM dbo.ShipmentTrackingEvents WHERE ShipmentId = @shipmentId ORDER BY OccurredAtUtc DESC;');
  return result.recordset;
}
