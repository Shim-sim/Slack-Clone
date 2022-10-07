import React, { useCallback } from 'react';
import useInput from '@hooks/useInput';
import { Container, Header } from '@pages/DirectMessage/styles';
import fetcher from '@utils/fetcher';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import useSWR from 'swr'
import ChatBox from '@components/ChatBox'
import ChatList from '@components/ChatList'


const DirectMessage = () => {
	
	
	const { workspace, id } = useParams<{ workspace: string; id: string }>();
	const { data: userData } = useSWR(
		`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/users/${id}`,fetcher
	);
	const { data: myData } = useSWR('https://sleactserver.run.goorm.io/api/users',fetcher);
	const [chat, onChangeChat] = useInput('');
	
	const onSubmitForm = useCallback((e)=> {
		e.preventDefault();
	}, []);
	
	
	if (!userData || !myData) {
		return null;
	}


	
	return (
		
		<Container>
			<Header>
				<img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
				<span>{userData.nickname}</span>
			</Header>
			<ChatList />
			<ChatBox chat="chat" onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>

		</Container>
		

	)
}

export default DirectMessage;
