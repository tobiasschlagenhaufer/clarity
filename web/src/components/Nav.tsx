import { Button, Flex, Heading, Box, useColorMode, Link, Image, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList, HStack, Switch } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

import NextLink from 'next/link'
import { useAuthState } from 'react-firebase-hooks/auth';
import { firebase, auth } from '../firebase'
import React from 'react';

const logout = () => {
    firebase.auth().signOut();
};

export const Nav = ({ name }: { name: string }) => {
    const [user, loading, error] = useAuthState(auth);
    const { colorMode, toggleColorMode } = useColorMode()
    const isDark = colorMode === 'dark'
    let body = null;

    if (loading) {
        // show nothing
    } else if (!user) {
        body = (
            <>
                <NextLink href="login">  
                    <Link fontSize="xl" mt={1}>Login</Link>
                </NextLink>
                {/* Register Button */}
                <NextLink href="register"> 
                    <Link fontSize="xl" ml={6} mt={1}>Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Menu>
                <MenuButton as={Button} colorScheme="green">
                    Account
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={logout}>
                        Logout
                    </MenuItem>
                    <MenuDivider />
                    <MenuGroup>
                        <MenuItem>
                        Color Mode
                        <HStack ml={2}>
                            {isDark ? <MoonIcon/> : <SunIcon/>}
                            <Switch
                                color="green"
                                isChecked={isDark}
                                onChange={toggleColorMode}
                            />
                            </HStack>
                        </MenuItem>
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup>
                        <MenuItem>
                            Pause Service
                        </MenuItem>
                        <MenuItem>
                            Cancel Service
                        </MenuItem>
                    </MenuGroup>

                </MenuList>
          </Menu>
        );
    }

    return (
        <Box width="100vw" p={4} bg={isDark ? "gray.900" : "white"} boxShadow="md">
            <Flex justifyContent="space-between" alignItems="center" maxW={"70rem"} m="0 auto">
                <Flex> 
                    <Image src="/static/Logo.png" height="7vh"/>
                    <Heading fontSize="4xl" fontWeight="light">{name}</Heading>
                </Flex>
                <Flex>
                    {body}
                </Flex>
            </Flex>
        </Box>
    )
  
};

Nav.defaultProps = {
  name: 'CarbonFree',
};