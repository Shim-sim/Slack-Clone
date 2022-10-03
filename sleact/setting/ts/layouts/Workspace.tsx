import React, { FC, useCallback } from 'react';
import axios from 'axios';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import { Redirect } from 'react-router';

const Workspace: FC = ({children}) => {
	const { data, error, revalidate } = useSWR('https://sleactserver.run.goorm.io/api/users', fetcher);
	
	const onLogout = useCallback(()=> {
		axios.post('https://sleactserver.run.goorm.io/api/users', null, {
			withCredentials: true,
		})
			.then(()=> {
				revalidate();
		})
	}, []);
	
	if (!data) {
		return <Redirect to="/login/" />;
	}
	
	return (
		<div>
	 		<button onClick={onLogout}>로그아웃</button>
			{children}
		</div>	
	)
}

export default Workspace;