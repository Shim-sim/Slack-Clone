import React, { useCallback } from 'react';
import useInput from '@hooks/useInput';
import { Container, Header } from '@pages/DirectMessage/styles';
import fetcher from '@utils/fetcher';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import useSWR from 'swr';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import axios from 'axios';
import { IDM } from '@typings/db';


const DirectMessage = () => {
	
	
	const { workspace, id } = useParams<{ workspace: string; id: string }>();
	const { data: userData } = useSWR(
		`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/users/${id}`,fetcher
	);
	const { data: myData } = useSWR('https://sleactserver.run.goorm.io/api/users',fetcher);
	const [chat, onChangeChat, setChat] = useInput('');
	const { data: chatData, mutate: mutateChat, revalidate} = useSWR<IDM[]>(
    () => `https://sleactserver.run.goorm.io/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
  );
	
	
	const onSubmitForm = useCallback((e)=> {
		e.preventDefault();
		if(chat?.trim()) {
			axios.post(`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/dms/${id}/chats`, {
				content: chat,
			})
			.then(() => {
				revalidate();
				setChat('');
			})
			.catch((error)=> {
				console.log(error);
			})
		}
	}, [chat]);
	
	
	if (!userData || !myData) {
		return null;
	}


	
	return (
		
		<Container>
			<Header>
				<img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
				<span>{userData.nickname}</span>
			</Header>
			<ChatList chatData={chatData}/>
			<ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
		</Container>
		

	)
}

export default DirectMessage;
