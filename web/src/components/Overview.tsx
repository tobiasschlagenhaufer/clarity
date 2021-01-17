import { Box, Text, Stat, StatGroup, StatHelpText, StatLabel, StatNumber, CircularProgress, CircularProgressLabel, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react';
import { Container } from './Container'
import { Main } from './Main'
import { Nav } from './Nav'
import { usersRef } from '../firebase'

interface OverviewProps {
    user: any
}
  
export const Overview = (props: OverviewProps) => {
    const [userData, setUserData] = useState({});
    const today = new Date();
    useEffect( () => {
        const data = {archivedMonths: {}, currentMonth: {}}
        usersRef.doc(props.user.uid)
            .collection("donations")
            .doc("archivedMonths").get().then((months) => {
                data.archivedMonths = months.data()!;

                usersRef.doc(props.user.uid)
                .collection("donations")
                .doc("currentMonth").get().then((month) => {
                    data.currentMonth = month.data()!;
                    setUserData(data);
                }
        );
            }
        );
    }, []);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const sum = ():string => {
        return (userData.archivedMonths.amountsPrev.reduce((acc: number, curr: string) => {
            console.log(acc, curr)
            return acc = acc + parseFloat(curr.slice(1,)) + parseFloat(curr.slice(1,))
        }, 0) + userData.currentMonth.monthTotal).toFixed(2);
    }

    console.log(userData);

    return (
    <Container height="100vh" overflow="hidden">
        <Nav />
        <Main>
            <Text>Overview</Text>
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
                <StatGroup>
                    <Box borderRadius="100%" borderWidth="1px" py={5}  w="11vw" h="11vw">
                        <Stat textAlign="center">
                            <StatLabel >Over</StatLabel>
                            <StatNumber fontSize="5xl">{Object.keys(userData).length ? (parseFloat(sum())/1.5).toFixed(0) : '0'}</StatNumber>
                            <StatHelpText >Trees Planted</StatHelpText>
                        </Stat>
                    </Box>

                    <Box borderRadius="100%" borderWidth="1px" py={5}  w="11vw" h="11vw">
                        <Stat textAlign="center">
                            <StatLabel >Over</StatLabel>
                            <StatNumber fontSize="5xl">{Object.keys(userData).length ? (parseFloat(sum())/2300*6400).toFixed(2) : '0'}</StatNumber>
                            <StatHelpText >Kg of CO2 Removed</StatHelpText>
                        </Stat>
                    </Box>

                    {/* <Box borderRadius="100%" borderWidth="1px" pt={10} w="13vw" h="13vw"> */}
                    <CircularProgress value={Object.keys(userData).length ? userData.currentMonth.monthTotal.toString()/sum()*100 : 0} color="green.400" size="12vw">
                        <CircularProgressLabel>
                            <Stat textAlign="center">
                                <StatLabel >Contributed</StatLabel>
                                <StatNumber fontSize="4xl">${Object.keys(userData).length ? userData.currentMonth.monthTotal.toString() : '0.00'}</StatNumber>
                                <StatHelpText >This {monthNames[today.getMonth()]}</StatHelpText>
                            </Stat>
                        </CircularProgressLabel>
                    {/* </Box> */}
                    </CircularProgress>

                    {/* <Box borderRadius="100%" borderWidth="1px" pt={10}  w="13vw" h="13vw"> */}
                    <CircularProgress value={100} color="green.400" size="12vw">
                        <CircularProgressLabel>

                        <Stat textAlign="center">
                            <StatLabel>Contributed</StatLabel>
                            {/* {console.log(userData.archivedMonths.amountsPrev)} */}
                            <StatNumber fontSize="4xl">${Object.keys(userData).length ? sum() : '0.00'}</StatNumber>
                            <StatHelpText>Total</StatHelpText>
                        </Stat>
                        </CircularProgressLabel>
                    {/* </Box> */}
                    </CircularProgress>
                </StatGroup>
            </Box>

            <Flex m={3}> 
                <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} width="100%">
                    <Text>Cool things happening with the organization.</Text>
                </Box>
                <Box ml={3} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} minW="20vw">
                    <Text>Contribution History</Text>
                    <Table size="lg" colorScheme="green">
                        <Tbody>
                            { userData.archivedMonths?.monthsPrev.map((month: any, i: number) => (
                            <Tr>
                                 <Td>{month}</Td>
                                 <Td>{userData.archivedMonths?.amountsPrev[i]}</Td>
                             </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Flex>
        </Main>
    </Container>
    );
};