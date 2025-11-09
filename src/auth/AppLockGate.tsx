// src/security/AppLockGate.tsx
import React from "react";
import * as LocalAuth from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styled from "styled-components/native";

const BIOMETRICS_KEY = "security:biometricsEnabled";

export default function AppLockGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const enabled = (await AsyncStorage.getItem(BIOMETRICS_KEY)) === "1";
      if (!enabled) {
        setReady(true);
        return;
      }
      const res = await LocalAuth.authenticateAsync({
        promptMessage: "Odblokuj aplikację",
        cancelLabel: "Anuluj",
        disableDeviceFallback: false,
      });
      setReady(res.success); // jeśli chcesz: przy niepowodzeniu możesz zamknąć appkę lub pozwolić na fallback.
    })();
  }, []);

  if (!ready) {
    return (
      <Gate>
        <GateText>Oczekiwanie na uwierzytelnienie…</GateText>
      </Gate>
    );
  }
  return <>{children}</>;
}

const Gate = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background: #fff;
`;
const GateText = styled.Text`
  color: #6b6b6b;
`;
