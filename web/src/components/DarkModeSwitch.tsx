import { SunIcon } from '@chakra-ui/icons'
import { useColorMode, Switch, HStack } from '@chakra-ui/react'

export const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  return (
    <HStack position="fixed" top="1rem" right="1rem">
      <SunIcon/>
      <Switch
        color="green"
        isChecked={isDark}
        onChange={toggleColorMode}
      />
    </HStack>
  )
}
