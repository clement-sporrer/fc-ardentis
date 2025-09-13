import React from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import fr from "react-phone-number-input/locale/fr.json";
import "react-phone-number-input/style.css";

const inputClasses =
  "w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground font-sport text-sm outline-none ring-offset-background transition-sport focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type Props = {
  value?: string;              // format E.164 (+33612345678)
  onChange: (value?: string) => void;
  defaultCountry?: string;     // "FR" par défaut
  required?: boolean;
};

export const PhoneField: React.FC<Props> = ({
  value,
  onChange,
  defaultCountry = "FR",
  required = false,
}) => {
  return (
    <div className="relative">
      <PhoneInput
        className="flex items-center gap-2"
        labels={fr}
        international
        defaultCountry={defaultCountry as any}
        countryCallingCodeEditable={false}
        value={value}
        onChange={onChange}
        numberInputProps={{
          className: inputClasses,
          inputMode: "tel",
          // pas d'espace saisi manuellement
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === " ") e.preventDefault();
          },
        }}
      />
      {value && !isValidPhoneNumber(value) && (
        <p className="mt-1 text-xs text-destructive font-sport">
          Numéro invalide pour ce pays
        </p>
      )}
    </div>
  );
};

export const isValidIntlPhone = (v?: string) =>
  !!v && isValidPhoneNumber(v);
