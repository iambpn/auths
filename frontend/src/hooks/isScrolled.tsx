export function useIsScrolled() {
  return {
    isScrolledToTop: (e: React.UIEvent<HTMLDivElement, UIEvent>): boolean => {
      const { scrollTop } = e.currentTarget;

      if (scrollTop < 1) {
        return true;
      }

      return false;
    },
    isScrolledToBottom: (e: React.UIEvent<HTMLDivElement, UIEvent>): boolean => {
      const { scrollHeight, clientHeight, scrollTop } = e.currentTarget;
      const scrollBottom = scrollHeight - clientHeight - scrollTop;

      if (scrollBottom < 1) {
        return true;
      }

      return false;
    },
  };
}
