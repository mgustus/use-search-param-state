import { fastIsEqual as isEqual } from 'fast-is-equal';
import { SetStateAction, useCallback, useMemo, useRef } from 'react';
import { clientNavigate } from './client.utils';
import type { StandardSchemaV1 } from './standardSchema';
import { useSearchParam } from './useSearchParam.hook';
import { parseParam, stringifyParam } from './useSearchParamState.helpers';

/**
 * Custom hook to manage state in URL search param.
 * @param paramName - The name of the search param.
 * @param parseAndValidateSchema - A schema to parse the string value of the search param to the desired type.
 * @param defaultValue - The default value to use if the search param is not present or invalid.
 * If not provided, the value will be returned as string.
 *
 * @template T - The type of the search param value after it was parsed from string.
 * @returns A tuple containing the current value of the search param and a function to update it.
 * */
export const useSearchParamState = <T = string | undefined>(
  paramName: string,
  parseAndValidateSchema: StandardSchemaV1<string | undefined, T>,
  defaultValue: T,
) => {
  const strValue = useSearchParam(paramName); // triggers parsedValue recalculation when search param changes

  // store the parsed value in a ref so the behavior of the hook will resemble useState.
  const parsedValueRef = useRef(defaultValue);

  // parse the string value of search param and put it in the ref. unlike useEffect, useMemo runs during render.
  useMemo(() => {
    const parsedValue = parseParam(strValue, parseAndValidateSchema, defaultValue);
    if (!isEqual(parsedValue, parsedValueRef.current)) parsedValueRef.current = parsedValue;
  }, [defaultValue, parseAndValidateSchema, strValue]);

  const setParamValue = useCallback(
    (newVal: SetStateAction<T | undefined>) => {
      const currValue = parsedValueRef.current;

      let newValue = typeof newVal === 'function' ? (newVal as (p: T) => T)(currValue) : newVal;
      if (newValue === '') newValue = undefined; // remove param if empty string

      if (isEqual(newValue, currValue)) return;

      const strNewValue = isEqual(newValue, defaultValue)
        ? undefined // delete param if it is equal to default value
        : stringifyParam(newValue);

      const updatedParams = new URLSearchParams(window.location.search);
      if (strNewValue === undefined)
        updatedParams.delete(paramName); // delete param
      else {
        updatedParams.set(paramName, strNewValue);
      }

      // update ref
      parsedValueRef.current = parseParam(strNewValue, parseAndValidateSchema, defaultValue);
      // Update the URL without reloading the page
      const searchString = updatedParams.toString();
      clientNavigate(`?${searchString}`);
    },
    [defaultValue, paramName, parseAndValidateSchema],
  );

  return [parsedValueRef.current, setParamValue] as const;
};
