export class AvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvailabilityError";
  }
}

export class SlotUnavailableError extends AvailabilityError {
  constructor(zoneId: string, startAt: Date, endAt: Date) {
    super(
      `The requested slot in zone ${zoneId} from ${startAt.toISOString()} to ${endAt.toISOString()} is no longer available.`
    );
    this.name = "SlotUnavailableError";
  }
}

export class InvalidSlotTimeError extends AvailabilityError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSlotTimeError";
  }
}

export class ZoneNotFoundError extends AvailabilityError {
  constructor(zoneId: string) {
    super(`Zone not found: ${zoneId}`);
    this.name = "ZoneNotFoundError";
  }
}
