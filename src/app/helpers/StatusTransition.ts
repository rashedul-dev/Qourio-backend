import { ParcelStatus } from "../modules/parcels/parcel.interface";

export const StatusTransitions: Record<ParcelStatus, ParcelStatus[]> = {
  [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
  [ParcelStatus.APPROVED]: [ParcelStatus.PICKED, ParcelStatus.CANCELLED, ParcelStatus.FLAGGED],
  [ParcelStatus.PENDING]: [ParcelStatus.REQUESTED, ParcelStatus.CANCELLED],
  [ParcelStatus.PICKED]: [ParcelStatus.DISPATCHED, ParcelStatus.FLAGGED],
  [ParcelStatus.DISPATCHED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.FLAGGED],
  [ParcelStatus.IN_TRANSIT]: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.RETURNED, ParcelStatus.FLAGGED],
  [ParcelStatus.RESCHEDULED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
  [ParcelStatus.DELIVERED]: [],
  [ParcelStatus.RETURNED]: [],
  [ParcelStatus.CANCELLED]: [],
  [ParcelStatus.BLOCKED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
  [ParcelStatus.FLAGGED]: [ParcelStatus.BLOCKED],
  [ParcelStatus.OUT_FOR_DELIVERY]: [ParcelStatus.DELIVERED, ParcelStatus.FAILED_ATTEMPT],
  [ParcelStatus.FAILED_ATTEMPT]: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.LOST],
  [ParcelStatus.LOST]: [],
  [ParcelStatus.DAMAGED]: [],
  [ParcelStatus.RECEIVED]: [ParcelStatus.APPROVED],
};

// Helper function to validate status transitions
export function isValidStatusTransition(currentStatus: ParcelStatus, nextStatus: ParcelStatus): boolean {
  const allowed = StatusTransitions[currentStatus] || [];
  return allowed.includes(nextStatus);
}

// Helper function to get all status values
export const getAllParcelStatuses = (): ParcelStatus[] => {
  return Object.values(ParcelStatus);
};
