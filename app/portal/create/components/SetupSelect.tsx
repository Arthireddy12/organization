import { Dropdown } from "@/components/common/dropdown";

export default function SetupSelect({
  value,
  options,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  const normalizedOptions = options.map((option) => ({
    label: option,
    value: option === "Please Select" ? "" : option,
  }));

  return (
    <Dropdown
      value={value}
      options={normalizedOptions}
      onChange={onChange}
      disabled={disabled}
      placeholder={
        placeholder ??
        normalizedOptions.find((option) => option.value === "")?.label ??
        "Select option"
      }
    />
  );
}
