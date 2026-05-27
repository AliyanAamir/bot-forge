import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  inviteLink: string;
  projectName: string;
  invitedByName: string;
  invitedByEmail: string;
  role: string;
}

export default function InviteEmail({
  inviteLink,
  projectName,
  invitedByName,
  invitedByEmail,
  role,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to {projectName} on BotForge</Preview>
      <Body
        style={{
          backgroundColor: "#f1f5f9",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            maxWidth: "520px",
            margin: "0 auto",
            padding: "40px 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#6366f1",
              color: "#ffffff",
              display: "inline-block",
              textAlign: "center",
              lineHeight: "44px",
              fontWeight: 700,
              fontSize: "18px",
              marginBottom: "20px",
            }}
          >
            B
          </div>
          <Heading style={{ fontSize: "22px", color: "#0f172a", margin: "0 0 8px" }}>
            You&apos;re invited to {projectName}
          </Heading>
          <Text style={{ fontSize: "15px", color: "#475569", lineHeight: 1.55, margin: "0 0 24px" }}>
            <strong>{invitedByName || invitedByEmail}</strong> invited you to collaborate on the
            BotForge project <strong>{projectName}</strong> as a <strong>{role}</strong>.
          </Text>
          <Section style={{ textAlign: "center", margin: "8px 0 24px" }}>
            <Button
              href={inviteLink}
              style={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Accept invitation
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", color: "#64748b", margin: "0 0 6px" }}>
            Or paste this link:
          </Text>
          <Text
            style={{
              fontSize: "12px",
              color: "#6366f1",
              wordBreak: "break-all",
              margin: "0 0 24px",
            }}
          >
            {inviteLink}
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
            This invite expires in 7 days. If you weren&apos;t expecting it, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
