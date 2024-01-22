type Option = {
  value: string;
  label: string;
};

export const formatEnums: <T extends string[]>(enums: T) => Option[] = (enums) =>
  enums.map((value) => ({ value, label: value }));
