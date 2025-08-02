import React from "react";
import { Modal, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface SModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** override width (number = px, or string like '50%') */
  width?: number | string;
  /** override height */
  height?: number | string;
}

const BackdropWrapper = styled(Box)(({ theme }) => ({
  // center content
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // full-screen overlay
  width: "100vw",
  height: "100vh",
}));

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'transarent',
  borderRadius: theme.custom.radii.lg,        // 8px
             // moderate elevation
  padding: theme.custom.spacing.lg,          // 16px
  boxSizing: "border-box",
}));

const SModal: React.FC<SModalProps> = ({
  open,
  onClose,
  children,
  width,
  height,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    closeAfterTransition
    style={{ backgroundColor: 'transparent' }}
    BackdropProps={{
      style: { backgroundColor: "rgba(0,0,0,0.5)" },
    }}
  >
    <BackdropWrapper>
      <ContentBox sx={{ 
        width: width ?? 'auto', 
        height: height ?? "auto", 
        }}>
        {children}
      </ContentBox>
    </BackdropWrapper>
  </Modal>
);

export default SModal;
