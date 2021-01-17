import React from "react";
import { auth } from '../firebase'
import { useAuthState } from "react-firebase-hooks/auth";
import { Landing } from "../components/Landing";
import { Box } from "@chakra-ui/react";
import { Overview } from "../components/Overview";

interface IndexProps {}

const Index = (props: IndexProps) => {
	const [user, loading] = useAuthState(auth);
	let body = null;

	if (loading) {
        // show nothing
    } else if (!user) {
		// not logged in, show landing
		body = ( <Landing /> );
	} else {
		body = ( <Overview user={user} /> )
	}
    
	return (
		<Box>
			{body}
		</Box>
	);
}

export default Index;

Index.defaultProps = {};