import { useTheme } from "@mui/material"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import DatastoreOverview from "./DatastoreOverview"

const DatastoreWidget = () => {
  const theme = useTheme()
  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}

      marginSize="sm"
      expand
      noShadow
      noBorder
      sx={{
        flex: 3
      }}
    >
      <HeadingBlock 
        heading={"Datastore Overview"}
        headingSize="h6"
        headingWeight={theme.custom.font.weight.regular}
        padding={0}
      />
        <DatastoreOverview />
    </SStack>
  )
}

export default DatastoreWidget
