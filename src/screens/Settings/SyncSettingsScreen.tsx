import React from "react";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import AccountConnections from "../../components/AccountConnections";
import { LOGIN_PROVIDERS } from "../../auth/providers/loginProviders";

export default function SyncSettingsScreen() {
  const { user, connectApple, connectGoogle, disconnect, loginWithEmail } =
    useAuth();
  const isGuest = user.kind === "guest";

  return (
    <Container>
      <Title>Synchronizacja</Title>
      <Subtitle>
        Połącz konto, aby Twoje dane były bezpieczne i dostępne na każdym
        urządzeniu.
      </Subtitle>

      {/* Dlaczego warto (benefity) */}
      <Card>
        <CardHeader>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color="#4a90e2"
          />
          <CardHeaderText>Dlaczego warto włączyć synchronizację</CardHeaderText>
        </CardHeader>

        <Benefit>
          <MaterialCommunityIcons
            name="cellphone-arrow-down"
            size={18}
            color="#1b1b1b"
          />
          <BenefitText>
            <Strong>Zmiana telefonu</Strong> — przenieś garderobę i ustawienia
            na nowe urządzenie bez ręcznego kopiowania.
          </BenefitText>
        </Benefit>

        <Benefit>
          <MaterialCommunityIcons
            name="backup-restore"
            size={18}
            color="#1b1b1b"
          />
          <BenefitText>
            <Strong>Kopie zapasowe</Strong> — odzyskaj dane po reinstalacji lub
            utracie urządzenia.
          </BenefitText>
        </Benefit>

        <Benefit>
          <MaterialCommunityIcons name="devices" size={18} color="#1b1b1b" />
          <BenefitText>
            <Strong>Wiele urządzeń</Strong> — używaj aplikacji na telefonie i
            tablecie z tym samym kontem.
          </BenefitText>
        </Benefit>
      </Card>

      {/* Przyszłościowy callout (Vinted itd.) */}
      <Callout>
        <CalloutRow>
          <MaterialCommunityIcons
            name="share-variant"
            size={18}
            color="#2563eb"
          />
          <CalloutText>
            <Strong>W najbliższym czasie:</Strong> udostępnianie ofert (np.
            Vinted) bezpośrednio z garderoby. Do tego będzie wymagane połączone
            konto.
          </CalloutText>
        </CalloutRow>
      </Callout>

      {/* Logowanie / Połączenia */}
      <Card>
        <AccountConnections
          key={user.id}
          isGuest={isGuest}
          provider={user.provider}
          email={user.email}
          providers={LOGIN_PROVIDERS} // email (mode: 'inline') pojawi się jako formularz
          onPressProvider={(id) => {
            if (id === "apple") connectApple?.();
            if (id === "google") connectGoogle?.();
            // facebook itd. w przyszłości
          }}
          onEmailSubmit={(email, pwd) => loginWithEmail?.(email, pwd)}
          onDisconnect={disconnect}
        />
      </Card>

      {/* Akcje synchronizacji po zalogowaniu */}
      {!isGuest && (
        <Card>
          <SectionHeader>
            <MaterialCommunityIcons
              name="cloud-sync-outline"
              size={20}
              color="#4a90e2"
            />
            <HeaderText>Akcje synchronizacji</HeaderText>
          </SectionHeader>

          <DisabledButton
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color="#6b7280"
            />
            <DisabledText>Uruchom synchronizację — wkrótce</DisabledText>
          </DisabledButton>

          <Hint>
            Ta funkcja pojawi się w kolejnej wersji. Dane konta są już
            połączone.
          </Hint>
        </Card>
      )}

      {/* Prywatność */}
      <FootNote>
        <MaterialCommunityIcons name="shield-check" size={16} color="#64748b" />
        <FootNoteText>
          Synchronizujemy wyłącznie dane potrzebne do działania aplikacji.
          Możesz odłączyć konto w dowolnym momencie.
        </FootNoteText>
      </FootNote>
    </Container>
  );
}

/* === styles === */
const Container = styled.ScrollView`
  flex: 1;
  background: #fff;
  padding: 16px;
`;
const Title = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: #1b1b1b;
`;
const Subtitle = styled.Text`
  color: #6b6b6b;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const Card = styled.View`
  background: #f7f8fb;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
`;
const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;
const CardHeaderText = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #1b1b1b;
`;

const Benefit = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  margin-top: 8px;
`;
const BenefitText = styled.Text`
  color: #1b1b1b;
  flex: 1;
  line-height: 20px;
`;
const Strong = styled.Text`
  font-weight: 700;
`;

const Callout = styled.View`
  background: #eef2ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
`;
const CalloutRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;
const CalloutText = styled.Text`
  color: #1b1b1b;
  flex: 1;
  line-height: 20px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;
const HeaderText = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #1b1b1b;
`;

const DisabledButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed #d1d5db;
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 12px;
  opacity: 0.6;
`;
const DisabledText = styled.Text`
  color: #6b7280;
  font-weight: 700;
`;

const FootNote = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
`;
const FootNoteText = styled.Text`
  color: #64748b;
  font-size: 12px;
  flex: 1;
  line-height: 18px;
`;

const Hint = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
  margin-top: 8px;
`;
