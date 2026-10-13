import { AppError } from '../../common/errors/AppError.js';
import { ORDER_TRANSITIONS } from './orders.constants.js';

export function assertTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return;
  const allowed = ORDER_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(409, 'INVALID_ORDER_STATUS_TRANSITION', `Cannot move order from ${currentStatus} to ${nextStatus}.`);
  }
}
