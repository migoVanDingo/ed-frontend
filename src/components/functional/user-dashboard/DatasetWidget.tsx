import HeadingBlock from "../../common/HeadingBlock"
import { SStack } from "../../styled/SStack"
import DatasetOverview from "./dataset-widget/DatasetOverview"

const DatasetWidget = () => {
  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}
      noBorder
      noShadow
      sx={{
        flex: 3,
      }}
    >
      <HeadingBlock 
      heading="Dataset Overview"
      headingWeight={200}
      />
      <DatasetOverview />
    </SStack>
  )
}

export default DatasetWidget
