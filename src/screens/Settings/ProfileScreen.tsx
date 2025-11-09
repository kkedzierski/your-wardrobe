import React from "react";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../auth/AuthContext";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { LOGIN_PROVIDERS } from "../../auth/providers/loginProviders";
import AccountConnections from "../../components/AccountConnections";

export default function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, connectApple, connectGoogle, disconnect } = useAuth();
  const isGuest = user.kind === "guest";

  return (
    <Container>
      <HeaderCard>
        <Avatar>
          <MaterialCommunityIcons
            name="account-circle"
            size={64}
            color="#9aa0a6"
          />
        </Avatar>
        <HeaderInfo>
          <Name>{user?.email || "Użytkownik"}</Name>
          <Meta>
            {isGuest
              ? "Tryb gościa"
              : `Zalogowano: ${user.provider}${
                  user.email ? ` • ${user.email}` : ""
                }`}
          </Meta>
        </HeaderInfo>
      </HeaderCard>

      {/* WYRÓŻNIONY CTA */}
      {isGuest ? (
        <CTA
          onPress={() => navigation.navigate("LoginOptions")}
          accessibilityRole="button"
        >
          <CTAText>Zaloguj się</CTAText>
        </CTA>
      ) : (
        <>
          <SectionTitle>Synchronizacja</SectionTitle>
          <Small>
            Twoje dane są chronione kopią zapasową i dostępne na wielu
            urządzeniach.
          </Small>
          <Card>
            <AccountConnections
              key={user.id}
              isGuest={isGuest}
              provider={user.provider}
              email={user.email}
              providers={LOGIN_PROVIDERS} // email pojawi się inline
              onPressProvider={(id) => {
                if (id === "apple") connectApple?.();
                if (id === "google") connectGoogle?.();
                // facebook itd. w przyszłości
              }}
              onEmailSubmit={(email, pwd) => loginWithEmail?.(email, pwd)}
              onDisconnect={disconnect}
            />
          </Card>
        </>
      )}
    </Container>
  );
}

/* styles */
const Container = styled.ScrollView`
  flex: 1;
  background: #fff;
  padding: 16px;
  gap: 12px;
`;
const HeaderCard = styled.View`
  background: #f7f8fb;
  border-radius: 16px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;
const Avatar = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: #eef1f4;
  align-items: center;
  justify-content: center;
`;
const HeaderInfo = styled.View`
  flex: 1;
`;
const Name = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #1b1b1b;
`;
const Meta = styled.Text`
  color: #6b6b6b;
  margin-top: 2px;
`;
const CTA = styled.TouchableOpacity`
  background: #0ea5e9;
  padding: 14px 16px;
  border-radius: 14px;
  align-items: center;
`;
const CTAText = styled.Text`
  color: #fff;
  font-weight: 800;
`;
const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #1b1b1b;
  margin-top: 8px;
`;
const Small = styled.Text`
  color: #6b6b6b;
  line-height: 20px;
`;
const Card = styled.View`
  background: #f7f8fb;
  border-radius: 16px;
  padding: 16px;
`;
