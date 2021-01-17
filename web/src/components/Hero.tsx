import { Box, Heading, Flex, Text, Button, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'

export const Hero = ({ title }: { title: string }) => (
	<Flex maxW={"70rem"} m="10vh auto" pt={8} justifyContent="space-between">
        <Box maxW="50%">
          <Heading fontWeight="light" fontSize="6xl">{title}</Heading>
		  <Text mt={10} fontSize="2xl">Invest your change on daily transactions into the Earth by becoming carbon neutral.</Text>
        </Box>
		<Box h="80vh" position="absolute" top={"15vh"} right={10} m={"-50px auto 0 auto"}  border="solid large black" borderRadius="10px" backgroundImage="url('/static/Underlay.png')" backgroundPosition="center" backgroundSize="auto 100%" p={"30vh"} backgroundRepeat="no-repeat">
			<VStack align="stretch" maxWidth="20vw" mr={5}>
				<Text fontSize="xl">Link your account to get started.</Text>
				<NextLink href="/register">
					<Button bg="white" p={3} fontSize="2xl">Lets Go</Button>
				</NextLink>
			</VStack>
		</Box>
    </Flex>
);

Hero.defaultProps = {
    title: 'Carbon offsetting on autopilot.',
}
