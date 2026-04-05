export type VehicleType = 'car' | 'bike' | 'suv';
export type ParkingZone = 'A' | 'B' | 'C' | 'Premium';

export interface ParkingSlot {
  id: string;
  zone: ParkingZone;
  slotNumber: number;
  vehicleType: VehicleType;
  isAllocated: boolean;
  eventId: string;
  gateHint: string;
}

export interface ParkingAllocation {
  slotId: string;
  zone: ParkingZone;
  slotNumber: number;
  vehicleType: VehicleType;
  gateHint: string;
  bookingId: string;
  userId: string;
  eventId: string;
  fee: number;
}

const ZONE_CONFIG: Record<ParkingZone, { gateHint: string; fee: number }> = {
  Premium: { gateHint: 'VIP Gate 1 — closest to main entrance', fee: 250 },
  A: { gateHint: 'Gate 2 — North entrance', fee: 100 },
  B: { gateHint: 'Gate 3 — East entrance', fee: 100 },
  C: { gateHint: 'Gate 4 — South entrance', fee: 100 },
};

const ZONES: ParkingZone[] = ['Premium', 'A', 'B', 'C'];

export function getParkingFee(zone: ParkingZone): number {
  return ZONE_CONFIG[zone].fee;
}

/**
 * Generates a mock parking inventory for an event.
 * Premium gets ~10%, rest split evenly across A/B/C.
 * Each zone supports all vehicle types.
 */
export function generateParkingSlots(eventId: string, totalSlots: number): ParkingSlot[] {
  const slots: ParkingSlot[] = [];
  const premiumCount = Math.max(2, Math.floor(totalSlots * 0.1));
  const regularCount = totalSlots - premiumCount;
  const perZone = Math.ceil(regularCount / 3);

  const vehicleTypes: VehicleType[] = ['car', 'bike', 'suv'];
  let slotNum = 1;

  const addSlots = (zone: ParkingZone, count: number) => {
    for (let i = 0; i < count; i++) {
      const vt = vehicleTypes[i % vehicleTypes.length];
      slots.push({
        id: `${eventId}-P${zone}-${slotNum}`,
        zone,
        slotNumber: slotNum,
        vehicleType: vt,
        isAllocated: Math.random() > 0.75, // ~25% pre-allocated for realism
        eventId,
        gateHint: ZONE_CONFIG[zone].gateHint,
      });
      slotNum++;
    }
  };

  addSlots('Premium', premiumCount);
  addSlots('A', perZone);
  addSlots('B', perZone);
  addSlots('C', Math.max(0, totalSlots - premiumCount - perZone * 2));

  return slots;
}

/**
 * Finds and allocates the next available parking slot.
 * Prefers the requested vehicle type; falls back to any available slot.
 * Returns the allocation details or null if nothing is available.
 */
export function allocateParking(
  slots: ParkingSlot[],
  preferredVehicle: VehicleType = 'car',
  eventId: string,
  bookingId: string,
  userId: string,
  preferredZone?: ParkingZone
): ParkingAllocation | null {
  // First try exact match on both zone and vehicle
  let slot = slots.find(s => !s.isAllocated && s.vehicleType === preferredVehicle && (!preferredZone || s.zone === preferredZone));
  
  // Try exact match on zone regardless of vehicle type
  if (!slot && preferredZone) {
    slot = slots.find(s => !s.isAllocated && s.zone === preferredZone);
  }

  // Fallback to preferred vehicle in any zone
  if (!slot) {
    slot = slots.find(s => !s.isAllocated && s.vehicleType === preferredVehicle);
  }

  // Final fallback to any available slot
  if (!slot) {
    slot = slots.find(s => !s.isAllocated);
  }
  if (!slot) return null;

  // Mark as allocated (mutates the array — simulates a DB update)
  slot.isAllocated = true;

  return {
    slotId: slot.id,
    zone: slot.zone,
    slotNumber: slot.slotNumber,
    vehicleType: slot.vehicleType,
    gateHint: slot.gateHint,
    bookingId,
    userId,
    eventId,
    fee: ZONE_CONFIG[slot.zone].fee,
  };
}

/** Returns counts of available / total slots, grouped by zone. */
export function getParkingAvailability(slots: ParkingSlot[]) {
  const total = slots.length;
  const available = slots.filter(s => !s.isAllocated).length;

  const byZone = ZONES.map(zone => {
    const zoneSlots = slots.filter(s => s.zone === zone);
    return {
      zone,
      total: zoneSlots.length,
      available: zoneSlots.filter(s => !s.isAllocated).length,
      fee: ZONE_CONFIG[zone].fee,
    };
  });

  return { total, available, byZone };
}
