import { Stack, StackProps } from '@chakra-ui/react'

export const Main = (props: StackProps) => (
  <Stack
    spacing="1.5rem"
    width="100%"
    maxWidth="70rem"
    // maxW={"1200px"} 
    m="0 auto"
    pt="3rem"
    px="1rem"
    {...props}
  />
)
