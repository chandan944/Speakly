// src/components/ui/password-input.tsx

import { Input, FormControl, FormLabel, Progress } from "@chakra-ui/react";
import { useState } from "react";

export const PasswordInput = () => {
  const [value, setValue] = useState("");
  return (
    <FormControl>
      <FormLabel>Password</FormLabel>
      <Input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </FormControl>
  );
};

export const PasswordStrengthMeter = ({ value }: { value: number }) => (
  <Progress value={value * 25} size="sm" colorScheme={value > 2 ? "green" : "red"} mt={2} />
);
