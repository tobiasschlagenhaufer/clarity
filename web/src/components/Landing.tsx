import { Text, Image } from '@chakra-ui/react'
  
import { Hero } from './Hero'
import { Container } from './Container'
import { Main } from './Main'
import { Nav } from './Nav'
// import Image from 'next/image'

export const Landing = () => {

	return (
		<Container height="100vh" overflow="hidden">
			<Nav />
			<Hero />

			<Main>
				<Text>
					{/* Example repository of <Code>Next.js</Code> + <Code>chakra-ui</Code> +{' '}
					<Code>typescript</Code>. */}
				</Text>
		
				{/* <List spacing={3} my={0}>
					<ListItem>
						<ListIcon as={CheckCircleIcon} color="green.500" />
						<ChakraLink
							isExternal
							href="https://chakra-ui.com"
							flexGrow={1}
							mr={2}
						>
							Chakra UI <LinkIcon />
						</ChakraLink>
					</ListItem>
					<ListItem>
						<ListIcon as={CheckCircleIcon} color="green.500" />
						<ChakraLink isExternal href="https://nextjs.org" flexGrow={1} mr={2}>
							Next.js <LinkIcon />
						</ChakraLink>
					</ListItem>
				</List> */}
			</Main>
			{/* <Footer>
				<Text>Next ❤️ Chakra</Text>
			</Footer> */}
			<Image src="/static/Backdrop2.png" alt="me" width="100%" height="auto" overflow="hidden" bottom="-30%" position="sticky" zIndex="-1" />
		</Container>
	);
};
  