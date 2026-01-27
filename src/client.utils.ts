export const clientNavigate = (url: string) => {
  window.history.replaceState({}, '', url);
};
