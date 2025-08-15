import React from 'react'
import { SStack } from '../../styled/SStack'
import { Typography } from '@mui/material'

const LLMWidget = () => {
  return (
        <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["primary", "light"]}
      paddingSize="md"
      marginSize="sm"
      expand
    >
        <Typography variant="h6">LLM Widget</Typography>
        <Typography variant="body2">This is a summary of the LLM.</Typography>
    </SStack>
  )
}

export default LLMWidget