export const handleStateUpdate = (stateFn, key, value) => {
  stateFn((pre) => ({
    ...pre,
    [key]: value,
  }));
};
