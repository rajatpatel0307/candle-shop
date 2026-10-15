import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { AppError } from '../../common/errors/AppError.js';

export async function updateProfile(userId, input) {
  const pool = await getPool();
  const result = await pool.request().input('user', sql.UniqueIdentifier, userId)
    .input('first', sql.NVarChar(100), input.firstName).input('last', sql.NVarChar(100), input.lastName || null)
    .input('phone', sql.NVarChar(30), input.phoneNumber || null)
    .query(`UPDATE dbo.Users SET FirstName=@first, LastName=@last, PhoneNumber=@phone, UpdatedAtUtc=SYSUTCDATETIME()
      WHERE UserId=@user AND IsDeleted=0;`);
  if (!result.rowsAffected[0]) throw new AppError(404, 'USER_NOT_FOUND', 'Account was not found.');
}

export async function saveAddress(userId, input, addressId = null) {
  const transaction = new sql.Transaction(await getPool());
  await transaction.begin();
  try {
    // Serialize address changes for this customer, including default-address updates.
    await new sql.Request(transaction).input('user', sql.UniqueIdentifier, userId)
      .query('SELECT UserId FROM dbo.Users WITH (UPDLOCK, HOLDLOCK) WHERE UserId=@user;');
    const existing = await new sql.Request(transaction).input('user', sql.UniqueIdentifier, userId)
      .query('SELECT AddressId FROM dbo.UserAddresses WHERE UserId=@user;');
    if (addressId && !existing.recordset.some((row) => row.AddressId.toLowerCase() === addressId.toLowerCase())) {
      throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Address was not found.');
    }
    const shippingDefault = input.isDefaultShipping || existing.recordset.length === 0;
    const billingDefault = input.isDefaultBilling || existing.recordset.length === 0;
    if (shippingDefault || billingDefault) {
      await new sql.Request(transaction).input('user', sql.UniqueIdentifier, userId)
        .input('shipping', sql.Bit, shippingDefault).input('billing', sql.Bit, billingDefault)
        .query(`UPDATE dbo.UserAddresses SET IsDefaultShipping=CASE WHEN @shipping=1 THEN 0 ELSE IsDefaultShipping END,
          IsDefaultBilling=CASE WHEN @billing=1 THEN 0 ELSE IsDefaultBilling END WHERE UserId=@user;`);
    }
    const request = new sql.Request(transaction)
      .input('id', sql.UniqueIdentifier, addressId || randomUUID()).input('user', sql.UniqueIdentifier, userId)
      .input('name', sql.NVarChar(150), input.recipientName).input('phone', sql.NVarChar(30), input.phoneNumber)
      .input('line1', sql.NVarChar(200), input.addressLine1).input('line2', sql.NVarChar(200), input.addressLine2 || null)
      .input('locality', sql.NVarChar(120), input.locality || null).input('city', sql.NVarChar(100), input.city)
      .input('state', sql.NVarChar(100), input.stateOrProvince).input('postal', sql.NVarChar(20), input.postalCode)
      .input('country', sql.Char(2), input.countryCode).input('label', sql.NVarChar(50), input.addressLabel)
      .input('shipping', sql.Bit, shippingDefault).input('billing', sql.Bit, billingDefault);
    const result = await request.query(addressId
      ? `UPDATE dbo.UserAddresses SET RecipientName=@name, PhoneNumber=@phone, AddressLine1=@line1, AddressLine2=@line2,
          Locality=@locality, City=@city, StateOrProvince=@state, PostalCode=@postal, CountryCode=@country,
          AddressLabel=@label, IsDefaultShipping=@shipping, IsDefaultBilling=@billing, UpdatedAtUtc=SYSUTCDATETIME()
          OUTPUT inserted.* WHERE AddressId=@id AND UserId=@user;`
      : `INSERT INTO dbo.UserAddresses (AddressId, UserId, RecipientName, PhoneNumber, AddressLine1, AddressLine2,
          Locality, City, StateOrProvince, PostalCode, CountryCode, AddressLabel, IsDefaultShipping, IsDefaultBilling)
          OUTPUT inserted.* VALUES (@id,@user,@name,@phone,@line1,@line2,@locality,@city,@state,@postal,@country,@label,@shipping,@billing);`);
    await transaction.commit();
    return result.recordset[0];
  } catch (error) { await transaction.rollback(); throw error; }
}

export async function deleteAddress(userId, addressId) {
  const transaction = new sql.Transaction(await getPool());
  await transaction.begin();
  try {
    await new sql.Request(transaction).input('user', sql.UniqueIdentifier, userId)
      .query('SELECT UserId FROM dbo.Users WITH (UPDLOCK, HOLDLOCK) WHERE UserId=@user;');
    const owned = await new sql.Request(transaction).input('user', sql.UniqueIdentifier, userId)
      .input('id', sql.UniqueIdentifier, addressId)
      .query('SELECT * FROM dbo.UserAddresses WITH (UPDLOCK, HOLDLOCK) WHERE UserId=@user AND AddressId=@id;');
    if (!owned.recordset.length) throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Address was not found.');
    await new sql.Request(transaction).input('user', sql.UniqueIdentifier, userId).input('id', sql.UniqueIdentifier, addressId)
      .query(`UPDATE dbo.CheckoutSessions SET ShippingAddressId=CASE WHEN ShippingAddressId=@id THEN NULL ELSE ShippingAddressId END,
        BillingAddressId=CASE WHEN BillingAddressId=@id THEN NULL ELSE BillingAddressId END WHERE UserId=@user;
        DELETE FROM dbo.UserAddresses WHERE UserId=@user AND AddressId=@id;`);
    await transaction.commit();
  } catch (error) { await transaction.rollback(); throw error; }
}
