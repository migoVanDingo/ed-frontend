import React from 'react'
import { SStack } from '../../styled/SStack'
import { Typography } from '@mui/material'

const NotificationWidget = () => {
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
      <Typography variant="h6">Notification Widget</Typography>
      <Typography variant="body2">This is a summary of the notifications.</Typography>
    </SStack>
  )
}

export default NotificationWidget