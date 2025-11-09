import React, { useMemo, useState } from "react";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type {
  ProviderConfig,
  LoginProviderId,
} from "../auth/providers/loginProviders";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export type AccountConnectionsProps = {
  isGuest: boolean;
  provider?: string | null;
  email?: string | null;

  providers: ProviderConfig[];
  onPressProvider: (id: LoginProviderId) => void;
  onDisconnect?: () => void;

  onEmailSubmit?: (email: string, password: string) => Promise<void> | void; // 👈
};

export default function AccountConnections({
  isGuest,
  provider,
  email,
  providers,
  onPressProvider,
  onDisconnect,
  onEmailSubmit,
}: AccountConnectionsProps) {
  if (isGuest) {
    // Czy mamy e-mail jako inline?
    const emailCfg = providers.find(
      (p) => p.id === "email" && p.mode === "inline"
    );
    const others = providers.filter(
      (p) => !(p.id === "email" && p.mode === "inline")
    );

    return (
      <>
        {emailCfg && <EmailInline onEmailSubmit={onEmailSubmit} />}

        {others.map((p) => {
          const content = (
            <>
              <BtnIcon>
                <MaterialCommunityIcons
                  name={p.iconName as any}
                  size={18}
                  color={
                    p.variant === "primary" || p.variant === "secondary"
                      ? "#fff"
                      : "#1b1b1b"
                  }
                />
              </BtnIcon>
              <BtnText $filled={p.variant !== "outline"}>
                {p.label}
                {p.note ? ` — ${p.note}` : ""}
              </BtnText>
            </>
          );

          const common = {
            key: p.id,
            onPress: p.enabled ? () => onPressProvider(p.id) : undefined,
            disabled: !p.enabled,
            accessibilityRole: "button" as const,
            accessibilityState: { disabled: !p.enabled },
            style: { opacity: p.enabled ? 1 : 0.5 },
            children: content,
          };

          if (p.variant === "primary") return <Primary {...common} />;
          if (p.variant === "secondary") return <Secondary {...common} />;
          return <Outline {...common} />;
        })}

        <Hint>Po zalogowaniu włączysz synchronizację i kopie zapasowe.</Hint>
      </>
    );
  }

  // Zalogowany
  return (
    <>
      <ConnectedRow>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={22}
          color="#22c55e"
        />
        <ConnectedText>
          Zalogowano: {provider ?? "konto"}
          {email ? ` • ${email}` : ""}
        </ConnectedText>
      </ConnectedRow>

      {/* Tu opcjonalnie możesz pokazać „Połącz kolejne konta”: providers.filter(p => p.id !== 'email') */}

      {onDisconnect && (
        <Danger onPress={onDisconnect} accessibilityRole="button">
          <DangerText>Wyloguj / Odłącz konto</DangerText>
        </Danger>
      )}
    </>
  );
}

/* ---------- Email inline (formularz) ---------- */
function EmailInline({
  onEmailSubmit,
}: {
  onEmailSubmit?: (email: string, password: string) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [touch, setTouch] = useState<{ e?: boolean; p?: boolean }>({});
  const [loading, setLoading] = useState(false);

  const emailErr = useMemo(() => {
    if (!touch.e) return "";
    if (!email) return "Podaj adres e-mail.";
    if (!EMAIL_RE.test(email)) return "Niepoprawny adres e-mail.";
    return "";
  }, [email, touch.e]);

  const pwdErr = useMemo(() => {
    if (!touch.p) return "";
    if (!pwd) return "Podaj hasło.";
    if (pwd.length < 6) return "Hasło musi mieć min. 6 znaków.";
    return "";
  }, [pwd, touch.p]);

  const canSubmit =
    !!onEmailSubmit && email && pwd && !emailErr && !pwdErr && !loading;

  const submit = async () => {
    if (!onEmailSubmit) return;
    try {
      setLoading(true);
      await onEmailSubmit(email.trim(), pwd);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmailCard>
      <EmailHeader>
        <MaterialCommunityIcons name="email-outline" size={18} color="#fff" />
        <EmailHeaderText>Logowanie e-mail / hasło</EmailHeaderText>
      </EmailHeader>

      <FieldLabel>E-mail</FieldLabel>
      <Input
        placeholder="twoj@email.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouch((t) => ({ ...t, e: true }))}
        returnKeyType="next"
      />
      {!!emailErr && <ErrorText>{emailErr}</ErrorText>}

      <FieldLabel>Hasło</FieldLabel>
      <PwdRow>
        <PwdInput
          placeholder="••••••••"
          secureTextEntry={!show}
          value={pwd}
          onChangeText={setPwd}
          onBlur={() => setTouch((t) => ({ ...t, p: true }))}
          returnKeyType="done"
          onSubmitEditing={() => canSubmit && submit()}
        />
        <Eye onPress={() => setShow((s) => !s)} accessibilityRole="button">
          <MaterialCommunityIcons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#6b6b6b"
          />
        </Eye>
      </PwdRow>
      {!!pwdErr && <ErrorText>{pwdErr}</ErrorText>}

      <Primary
        disabled={!canSubmit}
        onPress={submit}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        style={{ marginTop: 12, opacity: canSubmit ? 1 : 0.6 }}
      >
        <BtnText $filled>Zaloguj się</BtnText>
      </Primary>
    </EmailCard>
  );
}

/* === styles === */
const Primary = styled.TouchableOpacity`
  background: #0ea5e9;
  padding: 12px 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 8px;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
`;
const Secondary = styled.TouchableOpacity`
  background: #1f2937;
  padding: 12px 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 8px;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
`;
const Outline = styled.TouchableOpacity`
  border: 1px solid #d0d5dd;
  padding: 12px 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 8px;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
`;
const BtnIcon = styled.View``;
const BtnText = styled.Text<{ $filled?: boolean }>`
  color: ${({ $filled }) => ($filled ? "#fff" : "#1b1b1b")};
  font-weight: 700;
`;

const ConnectedRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  margin-top: 6px;
`;
const ConnectedText = styled.Text`
  color: #1b1b1b;
  font-weight: 600;
`;
const Danger = styled.TouchableOpacity`
  background: #ff4d4f;
  padding: 12px 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 16px;
`;
const DangerText = styled.Text`
  color: #fff;
  font-weight: 700;
`;
const Hint = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

/* Email inline styles */
const EmailCard = styled.View`
  background: #111;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 8px;
`;
const EmailHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;
const EmailHeaderText = styled.Text`
  color: #fff;
  font-weight: 800;
`;
const FieldLabel = styled.Text`
  font-size: 12px;
  color: #d1d5db;
  margin-top: 6px;
  margin-bottom: 4px;
`;
const Input = styled.TextInput`
  border: 1px solid #334155;
  background: #0b1220;
  color: #fff;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
`;
const PwdRow = styled.View`
  flex-direction: row;
  align-items: center;
  border: 1px solid #334155;
  background: #0b1220;
  border-radius: 10px;
  padding-left: 10px;
`;
const PwdInput = styled.TextInput`
  flex: 1;
  padding: 10px 0;
  font-size: 16px;
  color: #fff;
`;
const Eye = styled.TouchableOpacity`
  padding: 8px 12px;
`;
const ErrorText = styled.Text`
  color: #fecaca;
  margin-top: 4px;
`;
