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
  resetLink: string;
  requestedByOwner?: boolean;
  projectName?: string;
}

export default function PasswordResetEmail({ resetLink, requestedByOwner, projectName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Reset your BotForge password</Preview>
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
            Reset your password
          </Heading>
          <Text style={{ fontSize: "15px", color: "#475569", lineHeight: 1.55, margin: "0 0 24px" }}>
            {requestedByOwner ? (
              <>
                The owner of <strong>{projectName}</strong> has sent you a password reset link for
                your BotForge account.
              </>
            ) : (
              <>
                We received a request to reset your BotForge password. Click the button below to
                choose a new one.
              </>
            )}
          </Text>
          <Section style={{ textAlign: "center", margin: "8px 0 24px" }}>
            <Button
              href={resetLink}
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
              Reset password
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
            {resetLink}
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
            This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
