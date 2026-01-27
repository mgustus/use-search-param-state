/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import type { StandardSchemaV1 } from './standardSchema';

/**
 * Parses a URL search parameter value and validates it using the provided schema.
 * If the parameter is missing or invalid, the default value is returned.
 *
 * @template T - The type of the parsed value.
 * @param {string | undefined} strParamValue - The string value of the search parameter from the URL.
 * @param {StandardSchemaV1<string | undefined, T>} parseAndValidateSchema - The schema used to parse and validate the parameter. Supports any standard validation schema. For more information: https://github.com/standard-schema/standard-schema.
 * @param {T} defaultValue - The default value to return if the parameter is missing or invalid.
 * @param {(issues: readonly StandardSchemaV1.Issue[]) => void} [onError] - Optional callback to handle validation errors.
 * @returns {T} The parsed and validated value, or the default value if validation fails.
 */
export const parseParam = <T>(
  strParamValue: string | undefined,
  parseAndValidateSchema: StandardSchemaV1<string | undefined, T>,
  defaultValue: T,
  onError?: (issues: readonly StandardSchemaV1.Issue[]) => void
): T => {
  if (!strParamValue) return defaultValue;

  const res = parseAndValidateSchema['~standard'].validate(strParamValue);
  if (res instanceof Promise) {
    throw new TypeError('Asynchronous schema validation is not supported');
  }

  if (res.issues) {
    onError?.(res.issues);
    return defaultValue;
  }

  return res.value;
};

/**
 * Converts a value into a string representation suitable for use in a URL search parameter.
 *
 * @template T - The type of the value to stringify.
 * @param {T} value - The value to stringify.
 * @returns {string | undefined} The stringified value, or `undefined` if the value is `undefined`.
 */
export const stringifyParam = <T>(value: T): string | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value instanceof Object) return JSON.stringify(value);
  return value.toString();
};
