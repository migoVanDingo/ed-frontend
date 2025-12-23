import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHook";
import { closeModal } from "../../../store/slices/modalSlice";
import CreateProjectForm from "./CreateProjectForm";
import CreateDatasetForm from "./CreateDatasetForm";

const CreateOrganizationForm = ({ onClose }: { onClose: () => void }) => {
  return <div>TODO: Create Organization Form</div>;
};

const WorkspaceModalRoot: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, type, props } = useAppSelector((state) => state.modal);

  const handleClose = () => {
    dispatch(closeModal());
  };

  if (!type) {
    // No active modal, render nothing
    return null;
  }

  let title = "";
  let content: React.ReactNode = null;

  switch (type) {
    case "createProject":
      title = "Create Project";
      content = <CreateProjectForm onClose={handleClose} {...props} />;
      break;
    case "createDataset":
      title = "Create Dataset";
      content = <CreateDatasetForm onClose={handleClose} {...props} />;
      break;
    case "createOrg":
      title = "Create Organization";
      content = <CreateOrganizationForm onClose={handleClose} {...props} />;
      break;
    default:
      return null;
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        {title}
        <IconButton aria-label="close" onClick={handleClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{content}</DialogContent>
    </Dialog>
  );
};

export default WorkspaceModalRoot;
