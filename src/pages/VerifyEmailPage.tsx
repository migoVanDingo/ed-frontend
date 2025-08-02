import React from "react";
import { Box, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

const CenteredContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
    flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.default,

  paddingTop: 250 
}));

const MessageBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.custom.spacing.lg,    // 16px
  borderRadius: theme.custom.radii.lg, // 4px
  boxShadow: theme.shadows[2],
  maxWidth: 400,
  height: 'auto',
  textAlign: "center",

}));

const VerifyEmailPage = () => {
  const theme = useTheme();
  const nav = useNavigate();

  return (
    <CenteredContainer>
      <MessageBox>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 200,
            color: theme.palette.text.primary,
            textAlign: "left",
            borderRadius: theme.custom.radii.sm, // 2px
            padding: theme.custom.spacing.xs
          }}
        >
          An email has been sent to you.<br/>
          Click the link in that email to verify your account.
        </Typography>
        <Button 
                  type={"button"}
                  label={"Go to Login"}
                  color="primary" 
                  styles={{ width: '100%', borderRadius: theme.custom.radii.xs }} 
                  onClick={() => nav("/login")}
                  />
      </MessageBox>
    </CenteredContainer>
  );
}

export default VerifyEmailPage;