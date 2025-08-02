import { useTheme } from "@mui/material/styles"
import React from "react"
import { Outlet } from "react-router-dom"
import { Column } from "../common/Flex"
import LoadingSpinner from "../common/LoadingSpinner"
import SModal from "../styled/SModal"

const AuthLayout = () => {
  const theme = useTheme()
  const [loading, setLoading] = React.useState(false)
  const [modalText, setModalText] = React.useState("")

  return (
    <Column
      alignItems="center"
      sx={{
        minHeight: "100vh", // essential for full height
        backgroundColor: theme.palette.background.default,
      }}
      pt={0}
    >
      <Outlet context={{ setLoading, setModalText }}/>

      {loading && (
        <SModal open={loading} onClose={() => setLoading(false)}>
          <LoadingSpinner message={modalText} />
        </SModal>
      )}
    </Column>
  )
}

export default AuthLayout
