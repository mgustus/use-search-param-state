export const useSearchParam = (paramName: string) => {
    const strValue = new URLSearchParams(window.location.search).get(paramName) ?? undefined;

    return strValue;
}