import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Utility function to convert "HH:mm" to total minutes from midnight (0-1439)
export function timeToMinutes(timeString: string): number | null {
  const match = timeString.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null; // Invalid format
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null; // Invalid time range
  }

  return hours * 60 + minutes;
}

@ValidatorConstraint({ async: false })
export class IsLaterTimeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    if (!value || !relatedValue) {
      // Allow other decorators to handle missing values
      return true;
    }

    // Convert to minutes for reliable comparison
    const endTimeMinutes = timeToMinutes(value);
    const startTimeMinutes = timeToMinutes(relatedValue);

    // If either time is invalid, let the default validation handle it,
    // or return false if you want this decorator to also enforce time format validity
    if (endTimeMinutes === null || startTimeMinutes === null) {
      return true; // We'll rely on a separate @IsTimeString decorator for format check
    }

    // The 'value' (endTime) must be strictly greater than the 'relatedValue' (startTime)
    return endTimeMinutes > startTimeMinutes;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} ($value) must be after ${relatedPropertyName} (${(args.object as any)[relatedPropertyName]}) and in HH:mm format.`;
  }
}

// --- Step 1.2: Define the Decorator Function ---
export function IsLaterTime(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsLaterTimeConstraint,
    });
  };
}
