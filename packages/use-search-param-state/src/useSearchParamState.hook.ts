import { fastIsEqual as isEqual } from 'fast-is-equal';
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  useResolvedOptions,
  type Options,
} from './SearchParamStateProvider';
import type { StandardSchemaV1 } from './standardSchema';
import { useSearchParam } from './useSearchParam.hook';
import { parseParam, stringifyParam } from './useSearchParamState.helpers';

/**
 * Custom hook to manage state in URL search param.
 * @param paramName - The name of the search param.
 * @param parseAndValidateSchema - A schema to parse the string value of the search param to the desired type.
 * @param defaultValue - The default value to use if the search param is not present or invalid.
 * @param options - Per-call overrides. See {@link Options}. Per-call options override values provided via
 *   {@link SearchParamStateProvider}, which override library defaults.
 *
 * @template T - The type of the search param value after it was parsed from string.
 * @returns A tuple containing the current value of the search param and a function to update it.
 * */
export const useSearchParamState = <T = string | undefined>(
  paramName: string,
  parseAndValidateSchema: StandardSchemaV1<string | undefined, T>,
  defaultValue: T,
  options?: Options,
) => {
  const { clearOnDefault, clearOnError, onError, navigate } =
    useResolvedOptions(options);

  const strValue = useSearchParam(paramName); // triggers parsedValue recalculation when search param changes

  // store the parsed value in a ref so the behavior of the hook will resemble useState.
  const parsedValueRef = useRef(defaultValue);
  // tracks whether the latest parse attempt failed validation. Read by the
  // clear-on-error effect below; updated synchronously during render.
  const lastParseHadErrorRef = useRef(false);

  // parse the string value of search param and put it in the ref. unlike useEffect, useMemo runs during render.
  useMemo(() => {
    lastParseHadErrorRef.current = false;
    const parsedValue = parseParam(
      strValue,
      parseAndValidateSchema,
      defaultValue,
      (issues) => {
        lastParseHadErrorRef.current = true;
        onError?.(issues);
      },
    );
    if (!isEqual(parsedValue, parsedValueRef.current)) parsedValueRef.current = parsedValue;
  }, [defaultValue, parseAndValidateSchema, strValue, onError]);

  // When clearOnError is enabled and the URL contains a value that failed
  // validation, remove the offending param from the URL after commit.
  useEffect(() => {
    if (!clearOnError || !lastParseHadErrorRef.current) return;
    const updatedParams = new URLSearchParams(window.location.search);
    updatedParams.delete(paramName);
    navigate(`?${updatedParams.toString()}`);
  }, [strValue, parseAndValidateSchema, clearOnError, navigate, paramName]);

  const setParamValue = useCallback(
    (newVal: SetStateAction<T | undefined>) => {
      const currValue = parsedValueRef.current;

      let newValue = typeof newVal === 'function' ? (newVal as (p: T) => T)(currValue) : newVal;
      if (newValue === '') newValue = undefined; // remove param if empty string

      if (isEqual(newValue, currValue)) return;

      const strNewValue =
        clearOnDefault && isEqual(newValue, defaultValue)
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
      navigate(`?${searchString}`);
    },
    [defaultValue, paramName, parseAndValidateSchema, clearOnDefault, navigate],
  );

  return [parsedValueRef.current, setParamValue] as const;
};
